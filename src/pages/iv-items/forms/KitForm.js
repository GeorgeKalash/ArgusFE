import { useFormik } from 'formik'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { useForm } from 'src/hooks/form'
import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { InventoryRepository } from 'src/repositories/InventoryRepository'

const KitForm = ({ store, labels, maxAccess }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [numRows, setNumRows] = useState(0)

  const { formik } = useForm({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      kit: yup
        .array()
        .of(
          yup.object().shape({
            componentSKU: yup.string().test(function (value) {
              if (numRows > 1) {
                return !!value
              }

              return true
            }),
            qty: yup.number().test({
              test: function (value) {
                const { componentSKU } = this.parent

                if (componentSKU) {
                  return value > 0
                }

                return true
              }
            })
          })
        )
        .required()
    }),

    initialValues: {
      Kit: [
        {
          id: 1,
          kitId: recordId,
          muiId: '',
          componentId: '',
          componentName: '',
          componentSKU: '',
          qty: ''
        }
      ]
    },
    onSubmit: values => {
      postKit(values)
    }
  })

  const postKit = async obj => {
    const items = obj?.kit
      .map((item, index) => ({
        ...item,
        kitId: recordId,
        seqNo: index + 1
      }))
      .filter(item => item.componentId || item.componentName || item.componentSKU)

    const data = {
      kitId: recordId,
      components: items.length > 0 ? items : []
    }

    await postRequest({
      extension: InventoryRepository.Kit.set,
      record: JSON.stringify(data)
    }).then(res => {
      toast.success(platformLabels.Edited)
    })
  }

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.reference,
      name: 'componentSKU',
      props: {
        endpointId: InventoryRepository.Items.snapshot,
        parameters: {
          _startAt: 0,
          _size: 50
        },
        displayField: 'sku',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'componentId' },
          { from: 'sku', to: 'componentSKU' },
          { from: 'name', to: 'componentName' },
          { from: 'defSaleMUId', to: 'muId' }
        ],

        columnsInDropDown: [
          { key: 'name', value: 'Name' },
          { key: 'sku', value: 'Reference' }
        ]
      }
    },
    {
      component: 'textfield',
      label: labels.name,
      name: 'componentName',
      props: {
        readOnly: true
      }
    },

    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty'
    }
  ]

  useEffect(() => {
    setNumRows(formik?.values?.kit?.length)
  }, [formik.values.kit])

  function getData() {
    getRequest({
      extension: InventoryRepository.Kit.qry,
      parameters: `_kitId=${recordId}`
    })
      .then(res => {
        const modifiedList = res.list?.map((kitItems, index) => ({
          ...kitItems,
          id: index + 1
        }))
        formik.setValues({ kit: modifiedList })
      })
      .catch(error => {})
  }
  useEffect(() => {
    if (recordId) {
      getData()
    }
  }, [recordId])

  const formik2 = useFormik({
    maxAccess,
    initialValues: {
      name: store._name || '',
      reference: store._reference
    },
    enableReinitialize: true,
    validateOnChange: true
  })

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.PointOfSale}
      isCleared={false}
      infoVisible={false}
      maxAccess={maxAccess}
    >
      <VertLayout>
        <Grid container spacing={2}>
          <Grid item width={'50.1%'}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={formik2?.values?.name}
              readOnly
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item width={'50.1%'}>
            <CustomTextField
              name='reference'
              label={labels.reference}
              value={formik2?.values?.reference}
              readOnly
              maxAccess={maxAccess}
            />
          </Grid>
        </Grid>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('kit', value)}
            value={formik.values.kit || []}
            error={formik.errors.kit}
            allowDelete
            columns={columns}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default KitForm
