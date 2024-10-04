import { DataGrid } from 'src/components/Shared/DataGrid'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { useForm } from 'src/hooks/form'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'

const BarcodeForm = ({ store, labels, maxAccess }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [numRows, setNumRows] = useState(0)

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      barcodes: yup
        .array()
        .of(
          yup.object().shape({
            barcode: yup.string().test(function (value) {
              if (numRows > 1) {
                return !!value
              }

              return true
            })
          })
        )
        .required()
    }),
    initialValues: {
      barcodes: [
        {
          id: 1,
          itemId: recordId,
          barcode: '',
          muId: '',
          defaultQty: '',
          muRef: ''
        }
      ]
    },
    onSubmit: values => {
      const { barcodes } = values

      const isRowEmpty = row => {
        return !row.barcode
      }

      if (barcodes.length === 1 && isRowEmpty(barcodes[0])) {
        formik.setValues({ barcodes: [] })
        postdata([])
      } else {
        postdata(values)
      }
    }
  })

  const postdata = async obj => {
    try {
      const data = obj?.barcodes?.map(({ itemId, ...rest }) => ({
        itemId: recordId,
        ...rest
      }))

      const list = {
        itemId: recordId,
        barcodes: data || []
      }

      await postRequest({
        extension: InventoryRepository.Barcode.set2,
        record: JSON.stringify(list)
      })

      toast.success(platformLabels.Edited)
      getData()
    } catch (error) {}
  }

  const columns = [
    {
      component: 'textfield',
      label: labels.barcode,
      name: 'barcode'
    },

    {
      component: 'resourcecombobox',
      name: 'muId',
      label: labels.msUnit,
      props: {
        endpointId: store._msId ? InventoryRepository.MeasurementUnit.qry : '',
        parameters: `_msId=${store._msId}`,
        valueField: 'recordId',
        displayField: 'reference',
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        mapping: [
          { from: 'recordId', to: 'muId' },
          { from: 'reference', to: 'muRef' }
        ]
      }
    },

    {
      component: 'numberfield',
      name: 'defaultQty',
      label: labels.defaultQty,
      props: {
        allowNegative: false
      }
    }
  ]
  async function getData() {
    try {
      const response = await getRequest({
        extension: InventoryRepository.Barcode.qry,
        parameters: `_itemId=${recordId}&_pageSize=50&_startAt=0`
      })

      const modifiedList = response.list?.map((category, index) => ({
        ...category,
        id: index + 1
      }))

      formik.setValues({ barcodes: modifiedList })
    } catch (error) {}
  }
  useEffect(() => {
    if (recordId) {
      getData()
    }
  }, [recordId])

  useEffect(() => {
    setNumRows(formik.values.barcodes.length)
  }, [formik.values.barcodes])

  const handleSubmit = () => {
    formik.handleSubmit()
  }

  return (
    <VertLayout>
      <Grow>
        <DataGrid
          onChange={value => formik.setFieldValue('barcodes', value)}
          value={formik.values.barcodes || []}
          error={formik.errors.barcodes}
          columns={columns}
        />
        <Fixed>
          <WindowToolbar onSave={handleSubmit} isSaved={true} />
        </Fixed>
      </Grow>
    </VertLayout>
  )
}

export default BarcodeForm
