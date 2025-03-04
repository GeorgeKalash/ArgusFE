import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { DataGrid } from 'src/components/Shared/DataGrid'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { ResourceIds } from 'src/resources/ResourceIds'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function OverheadTab({ labels, maxAccess, store }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const recordId = store?.recordId
  const editMode = !!recordId

  const { formik } = useForm({
    enableReinitialize: false,
    validateOnChange: true,
    initialValues: {
      items: [
        {
          id: 1,
          jobId: recordId,
          overheadId: '',
          seqNo: '',
          amount: 0,
          units: 0,
          unitCost: 0
        }
      ]
    },
    validationSchema: yup.object({
      items: yup.array().of(
        yup.object({
          overheadRef: yup.string().test(function (value) {
            const isAnyFieldFilled = this.parent.units
            if (this.options.from[1]?.value?.items?.length === 1) {
              if (isAnyFieldFilled && isAnyFieldFilled != 0) {
                return !!value
              }

              return true
            }

            return !!value
          }),
          overheadName: yup.string().test(function (value) {
            const isAnyFieldFilled = this.parent.units
            if (this.options.from[1]?.value?.items?.length === 1) {
              if (isAnyFieldFilled && isAnyFieldFilled != 0) {
                return !!value
              }

              return true
            }

            return !!value
          }),
          units: yup.string().test('check-value', 'Units must be at least 1', function (value) {
            const isOverheadFilled = !!this.parent.overheadRef
            if (isOverheadFilled) {
              const numericValue = Number(value)

              if (!value || isNaN(numericValue) || numericValue < 1) {
                return false
              }
            }

            return true
          })
        })
      )
    }),
    onSubmit: async obj => {
      const modifiedItems = obj?.items
        .map((details, index) => {
          return {
            ...details,
            seqNo: index + 1,
            jobId: recordId
          }
        })
        .filter(item => item.overheadRef || item.units)

      const payload = { jobId: recordId, items: modifiedItems }
      await postRequest({
        extension: ManufacturingRepository.JobOverhead.set2,
        record: JSON.stringify(payload)
      })
      toast.success(platformLabels.Edited)
    }
  })

  const totAmount = formik.values.items.reduce((amountSum, row) => {
    const amountValue = parseFloat(row?.amount?.toString().replace(/,/g, '')) || 0

    return amountSum + amountValue
  }, 0)

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.overheadRef,
      name: 'overheadRef',
      props: {
        endpointId: ManufacturingRepository.Overhead.snapshot,
        displayField: 'reference',
        valueField: 'reference',
        mapping: [
          { from: 'recordId', to: 'overheadId' },
          { from: 'reference', to: 'overheadRef' },
          { from: 'name', to: 'overheadName' },
          { from: 'unitCost', to: 'unitCost' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ],
        displayFieldWidth: 2
      },
      async onChange({ row: { update, newRow } }) {
        update({
          overheadId: newRow?.overheadId,
          overheadRef: newRow?.overheadRef,
          overheadName: newRow?.overheadName,
          unitCost: newRow?.unitCost || 0
        })
      }
    },
    {
      component: 'textfield',
      label: labels.overheadName,
      name: 'overheadName',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.units,
      name: 'units',
      defaultValue: 0,
      async onChange({ row: { update, newRow } }) {
        update({ amount: newRow?.units * newRow?.unitCost || 0 })
      }
    },
    {
      component: 'numberfield',
      label: labels.unitCost,
      name: 'unitCost',
      defaultValue: 0,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.amount,
      name: 'amount',
      defaultValue: 0,
      props: {
        readOnly: true
      }
    }
  ]

  const actions = [
    {
      key: 'GenerateJob',
      condition: true,
      onClick: generateOVH,
      disabled: store?.isPosted || store?.isCancelled
    }
  ]

  async function generateOVH() {
    await postRequest({
      extension: ManufacturingRepository.JobOverhead.generate,
      record: JSON.stringify({ jobId: recordId })
    })
    toast.success(platformLabels.Generated)
  }

  async function fetchGridData() {
    const res = await getRequest({
      extension: ManufacturingRepository.JobOverhead.qry,
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
        : [{ id: 1 }]

    formik.setFieldValue('items', updateItemsList)
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) await fetchGridData()
    })()
  }, [recordId])

  return (
    <FormShell
      resourceId={ResourceIds.MFJobOrders}
      form={formik}
      maxAccess={maxAccess}
      editMode={editMode}
      isInfo={false}
      isSavedClear={false}
      actions={actions}
      disabledSubmit={store?.isCancelled || store?.isPosted}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            name='items'
            maxAccess={maxAccess}
            allowDelete={!store?.isPosted && !store?.isCancelled}
          />
        </Grow>
        <Fixed>
          <Grid container p={2}>
            <Grid item xs={2}>
              <CustomNumberField name='totalAmount' label={labels.total} value={totAmount} readOnly />
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
