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

export default function ItemTab({ labels, maxAccess, store }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const recordId = store?.recordId

  const { formik } = useForm({
    validateOnChange: true,
    initialValues: {
      items: [
        {
          id: 1,
          jobId: recordId,
          itemId: null,
          seqNo: 0,
          qty: 0,
          pcs: 0,
          sku: '',
          itemName: ''
        }
      ]
    },
    validationSchema: yup.object({
      items: yup.array().of(
        yup.object({
          sku: yup.string().test(function (value) {
            const { itemName, qty, pcs } = this.parent
            const isAnyFilled = !!value || !!itemName || qty > 0 || pcs > 0

            if (!isAnyFilled) return true

            return !!value
          }),
          itemName: yup.string().test(function (value) {
            const { sku, qty, pcs } = this.parent
            const isAnyFilled = !!sku || !!value || qty > 0 || pcs > 0

            if (!isAnyFilled) return true

            return !!value
          }),
          qty: yup.number().test(function (value) {
            const { sku, itemName, pcs } = this.parent
            const isAnyFilled = !!sku || !!itemName || pcs > 0 || value > 0

            if (!isAnyFilled) return true

            return value != null && value >= 1
          }),
          pcs: yup.number().test(function (value) {
            const { sku, itemName, qty } = this.parent
            const isAnyFilled = !!sku || !!itemName || qty > 0 || (value ?? 0) > 0

            if (!isAnyFilled) return true

            return (value ?? 0) >= 0
          })
        })
      )
    }),
    onSubmit: async obj => {
      const filteredItems = obj?.items.filter(row => row.sku || row.itemName || row.qty > 0 || row.pcs > 0)

      const modifiedItems = filteredItems.map((details, index) => {
        return {
          ...details,
          seqNo: index + 1,
          jobId: recordId
        }
      })

      const payload = { jobId: recordId, items: modifiedItems }
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
        allowNegative: false
      }
    },
    {
      component: 'numberfield',
      label: labels.pcs,
      name: 'pcs',
      props: {
        allowNegative: false,
        decimalScale: 0
      }
    }
  ]

  async function fetchGridData() {
    const res = await getRequest({
      extension: ManufacturingRepository.JobOrdersItem.qry,
      parameters: `_jobId=${recordId}`
    })

    const updateItemsList =
      res?.list?.length != 0
        ? await Promise.all(
            res?.list?.map(async (item, index) => {
              return {
                ...item,
                id: index + 1
              }
            })
          )
        : formik.initialValues.items

    formik.setFieldValue('items', updateItemsList)
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) await fetchGridData()
    })()
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
        <WindowToolbar onSave={formik.submitForm} isSaved smallBox />
      </Fixed>
    </VertLayout>
  )
}
