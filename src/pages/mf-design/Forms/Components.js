import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import toast from 'react-hot-toast'
import * as yup from 'yup'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'

const Components = ({ store, maxAccess, labels }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    validateOnChange: true,
    maxAccess,
    initialValues: {
      designId: recordId,
      items: [
        {
          id: 1,
          designId: recordId,
          itemId: null,
          seqNo: null,
          qty: null,
          pcs: null
        }
      ]
    },
    validationSchema: yup.object({
      items: yup.array().of(
        yup.object({
          itemId: yup.number().required(),
          qty: yup.number().required(),
          pcs: yup.number().required().max(2147483647)
        })
      )
    }),
    onSubmit: async values => {
      const item = formik.values.items.map((item, index) => ({
        ...item,
        seqNo: index + 1,
        id: index + 1
      }))

      const data = { ...values, items: item }

      await postRequest({
        extension: ManufacturingRepository.Components.set2,
        record: JSON.stringify(data)
      }).then(() => {
        toast.success(platformLabels.Edited)
      })

      getData(recordId)
    }
  })

  const editMode = !!recordId

  const getData = recordId => {
    getRequest({
      extension: ManufacturingRepository.Components.qry,
      parameters: `_designId=${recordId}`
    }).then(res => {
      if (res?.list?.length > 0) {
        const items = res.list.map((item, index) => ({
          ...item,
          id: index + 1,
          seqNo: index + 1
        }))
        formik.setValues({ ...formik.values, recordId, items: items })
      }
    })
  }

  useEffect(() => {
    if (recordId) {
      getData(recordId)
    }
  }, [])

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.sku,
      name: 'itemId',
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        displayField: 'sku',
        valueField: 'recordId',
        columnsInDropDown: [
          { key: 'sku', value: 'Sku' },
          { key: 'name', value: 'Name' }
        ],
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'name', to: 'itemName' },
          { from: 'sku', to: 'sku' }
        ],
        displayFieldWidth: 2
      }
    },
    {
      component: 'textfield',
      label: labels.itemName,
      name: 'itemName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.qty,
      name: 'qty',
      props: {
        decimalScale: 3,
        maxLength: 12
      }
    },
    {
      component: 'numberfield',
      label: labels.pcs,
      name: 'pcs',
      props: {
        decimalScale: 0,
        maxLength: 10
      }
    }
  ]

  return (
    <FormShell
      form={formik}
      resourceId={ResourceIds.Designs}
      maxAccess={maxAccess}
      isCleared={false}
      editMode={editMode}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default Components
