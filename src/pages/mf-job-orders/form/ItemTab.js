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
import { createConditionalSchema } from 'src/lib/validation'
import { Grid } from '@mui/material'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { useWindow } from 'src/windows'
import SerialsLots from './SerialsLots'
import Form from 'src/components/Shared/Form'

export default function ItemTab({ labels, maxAccess, store }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { recordId, jobItems } = store || {}
  const { stack } = useWindow()

  const conditions = {
    sku: row => row?.sku,
    itemName: row => row?.itemName,
    qty: row => row?.qty > 0
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const getMaterialPercentages = () => {
    const materials = store?.jobMaterials || []

    let metal = 0
    let nonMetal = 0

    materials.forEach(m => {
      const qty = parseFloat(m.qty) || 0

      if (m.isMetal) metal += qty
      else nonMetal += qty
    })

    const total = metal + nonMetal || 1

    return {
      metalPct: (metal / total) * 100,
      nonMetalPct: (nonMetal / total) * 100
    }
  }

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
          itemName: '',
          metalQty: 0,
          nonMetalQty: 0
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
          { from: 'name', to: 'itemName' },
          { from: 'trackBy', to: 'trackBy' }
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
            api: ManufacturingRepository.MFSerial.qry2,
            parameters: `_jobId=${recordId}&_seqNo=${row.seqNo}`
          }
        })
      }
    },
    {
      component: 'numberfield',
      label: labels.metalQty,
      name: 'metalQty',
      props: {
        decimalScale: 2
      }
    },
    {
      component: 'numberfield',
      label: labels.nonMetalQty,
      name: 'nonMetalQty',
      props: {
        decimalScale: 2
      }
    },
    {
      component: 'button',
      name: 'default',
      label: platformLabels.default,
      flex: 0.5,
      onClick: () => {
        const { metalPct, nonMetalPct } = getMaterialPercentages()

        const updatedItems = formik.values.items.map(row => ({
          ...row,
          metalQty: metalPct,
          nonMetalQty: nonMetalPct
        }))

        formik.setFieldValue('items', updatedItems)
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

  useEffect(() => {
    ;(async function () {
      formik.setValues({
        jobId: recordId,
        items:
          jobItems?.length > 0
            ? await Promise.all(
                jobItems?.map((item, index) => {
                  return {
                    ...item,
                    id: index + 1,
                    metal: item?.metal || 0,
                    nonMetal: item?.nonMetal || 0,
                    extendedCost: (item?.unitCost || 0) * (item?.qty || 0)
                  }
                })
              )
            : formik.initialValues.items
      })
    })()
  }, [jobItems])

  return (
    <Form
      onSave={formik.handleSubmit}
      maxAccess={maxAccess}
      isParentWindow={false}
      disabledSubmit={store?.isCancelled || store?.isPosted}
    >
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
        <Grid container p={4} justifyContent='flex-end'>
          <Grid item xs={2}>
            <CustomNumberField name='totalCost' label={labels.totalCost} value={totalCost} readOnly />
          </Grid>
        </Grid>
      </VertLayout>
    </Form>
  )
}
