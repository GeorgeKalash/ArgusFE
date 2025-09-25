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
import { Grid } from '@mui/material'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { useWindow } from 'src/windows'
import SerialsLots from './SerialsLots'

export default function ItemTab({ labels, maxAccess, store }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const recordId = store?.recordId
  const { stack } = useWindow()

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

  const onCondition = row => {
    if (row.trackBy === 1) {
      return {
        imgSrc: '/images/TableIcons/imgSerials.png',
        hidden: false
      }
    } else {
      return {
        imgSrc: '',
        hidden: true
      }
    }
  }

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
      },
      updateOn: 'blur',
      async onChange({ row: { update, newRow } }) {
        update({ qty: newRow?.qty || 0, extendedCost: (newRow?.qty || 0) * (newRow?.unitCost || 0) })
      }
    },
    {
      component: 'numberfield',
      label: labels.pcs,
      name: 'pcs',
      props: {
        decimalScale: 0,
        maxLength: 5
      }
    },
    {
      component: 'numberfield',
      label: labels.unitCost,
      name: 'unitCost',
      props: {
        readOnly: true,
        decimalScale: 2
      }
    },
    {
      component: 'numberfield',
      label: labels.extendedCost,
      name: 'extendedCost',
      props: {
        readOnly: true,
        decimalScale: 2
      }
    },
    {
      component: 'button',
      name: 'serials',
      label: platformLabels.serials,
      flex: 0.5,
      props: {
        onCondition
      },
      onClick: (e, row) => {
        stack({
          Component: SerialsLots,
          props: {
            labels,
            maxAccess,
            recordId,
            api: ManufacturingRepository.MFSerial.qry2,
            parameters: `_jobId=${recordId}&_seqNo=${row.seqNo}`
          }
        })
      }
    }
  ]

  const totalCost =
    formik?.values?.items?.length > 0
      ? formik.values.items.reduce((extendedSum, row) => {
          const extendedValue = parseFloat(row.extendedCost?.toString().replace(/,/g, '')) || 0

          return extendedSum + extendedValue
        }, 0)
      : 0

  async function fetchGridData() {
    const res = await getRequest({
      extension: ManufacturingRepository.JobOrdersItem.qry,
      parameters: `_jobId=${recordId}`
    })

    if (res?.list?.length > 0) {
      const updateItemsList = res.list.map((item, index) => ({
        ...item,
        id: index + 1,
        extendedCost: (item?.unitCost || 0) * (item?.qty || 0)
      }))

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
        <Grid container p={4} justifyContent='flex-end'>
          <Grid item xs={2}>
            <CustomNumberField name='totalCost' label={labels.totalCost} value={totalCost} readOnly />
          </Grid>
        </Grid>

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
