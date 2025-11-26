import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grid } from '@mui/material'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function OverheadTab({ labels, maxAccess, store }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { jobOverheads, recordId, isPosted, isCancelled } = store || {}
  const editMode = !!recordId

  const { formik } = useForm({
    maxAccess,
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

              if (!value || isNaN(numericValue)) {
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

  const totAmount = formik?.values?.items?.reduce((amountSum, row) => {
    const amountValue = Math.round(parseFloat(row?.amount?.toString().replace(/,/g, '')) || 0)

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
      async onChange({ row: { update, newRow } }) {
        update({ amount: newRow?.units * newRow?.unitCost || 0 })
      }
    },
    {
      component: 'numberfield',
      label: labels.unitCost,
      name: 'unitCost',
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      label: labels.amount,
      name: 'amount',
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
      disabled: isPosted || isCancelled
    }
  ]

  async function generateOVH() {
    await postRequest({
      extension: ManufacturingRepository.JobOverhead.generate,
      record: JSON.stringify({ jobId: recordId })
    })
    toast.success(platformLabels.Generated)
  }

  useEffect(() => {
    ;(async function () {
      formik.setFieldValue(
        'items',
        jobOverheads?.length > 0
          ? await Promise.all(
              jobOverheads?.map((item, index) => {
                return {
                  ...item,
                  id: index + 1
                }
              })
            )
          : formik.initialValues.items
      )
    })()
  }, [jobOverheads])

  return (
    <Form
      onSave={formik.handleSubmit}
      maxAccess={maxAccess}
      editMode={editMode}
      actions={actions}
      isCleared
      disabledSubmit={isCancelled || isPosted}
    >
      <VertLayout>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            initialValues={formik?.initialValues?.items?.[0]}
            name='items'
            maxAccess={maxAccess}
            allowDelete={!isPosted && !isCancelled}
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
    </Form>
  )
}
