import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { createConditionalSchema } from 'src/lib/validation'

export default function ItemTab({ labels, maxAccess, store }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const recordId = store?.recordId

  const conditions = {
    sku: row => row?.sku,
    itemName: row => row?.itemName,
    qty: row => row?.qty > 0
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const { formik } = useForm({
    initialValues: {
      items: [
        {
          id: 1,
          jobId: recordId,
          itemId: null,
          seqNo: 1,
          qty: 0,
          pcs: 0,
          sku: '',
          itemName: ''
        }
      ]
    },
    conditionSchema: ['items'],
    validationSchema: yup.object({
      items: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      const filteredItems = obj?.items
        .filter(row => Object.values(requiredFields).some(fn => fn(row)))
        .map((details, index) => ({
          ...details,
          seqNo: index + 1,
          jobId: recordId
        }))

      const payload = { jobId: recordId, items: filteredItems }
      await postRequest({
        extension: ManufacturingRepository.JobOrdersItem.set2,
        record: JSON.stringify(payload)
      })
      toast.success(platformLabels.Updated)
    }
  })

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.item,
      name: 'sku',
      props: {
        endpointId: InventoryRepository.Item.snapshot,
        valueField: 'sku',
        displayField: 'sku',
        displayFieldWidth: 2,
        mapping: [
          { from: 'recordId', to: 'itemId' },
          { from: 'sku', to: 'sku' },
          { from: 'name', to: 'itemName' }
        ],
        columnsInDropDown: [
          { key: 'sku', value: 'SKU' },
          { key: 'name', value: 'Name' }
        ]
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
        allowNegative: false,
        maxLength: 9
      }
    },
    {
      component: 'numberfield',
      label: labels.pcs,
      name: 'pcs',
      props: {
        decimalScale: 0,
        maxLength: 9
      }
    }
  ]

  async function fetchGridData() {
    const res = await getRequest({
      extension: ManufacturingRepository.JobOrdersItem.qry,
      parameters: `_jobId=${recordId}`
    })
    if (res?.list?.length > 0) {
      const updateItemsList = await Promise.all(
        res?.list?.map(async (item, index) => {
          return {
            ...item,
            id: index + 1
          }
        })
      )

      formik.setFieldValue('items', updateItemsList)
    }
  }

  useEffect(() => {
    if (recordId) fetchGridData()
  }, [recordId])

  return (
    <VertLayout>
      <Grow>
        <DataGrid
          name='items'
          onChange={value => formik.setFieldValue('items', value)}
          value={formik.values.items}
          error={formik.errors.items}
          columns={columns}
          initialValues={formik?.initialValues?.items?.[0]}
          maxAccess={maxAccess}
          allowDelete={!store?.isPosted && !store?.isCancelled}
        />
      </Grow>
      <Fixed>
        <WindowToolbar
          disabledSubmit={store?.isCancelled || store?.isPosted}
          onSave={formik.submitForm}
          isSaved
          smallBox
        />
      </Fixed>
    </VertLayout>
  )
}
