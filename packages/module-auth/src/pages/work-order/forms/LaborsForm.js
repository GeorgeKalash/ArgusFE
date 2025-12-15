import { useContext, useEffect } from 'react'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import * as yup from 'yup'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import toast from 'react-hot-toast'
import { RepairAndServiceRepository } from '@argus/repositories/src/repositories/RepairAndServiceRepository'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'
import { Grid } from '@mui/material'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const LaborsForm = ({
  data: { seqNo, taskName, status },
  access,
  labels,
  store: { reference, isPosted, recordId }
}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const isCompleted = status === 2

  const conditions = {
    laborId: row => row?.laborId,
    hours: row => row?.hours
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, access, 'labors')

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      labors: [{ id: 1, workOrderId: recordId, seqNo, hours: 0, qty: 0, rate: 0 }]
    },
    validationSchema: yup.object({
      labors: yup.array().of(schema)
    }),
    onSubmit: async values => {
      const data = {
        workOrderId: recordId,
        seqNo,
        labors: values.labors
          ?.filter(row => Object.values(requiredFields)?.every(fn => fn(row)))
          .map(({ id, laborRef, firstName, lastName, rate, ...item }, index) => ({
            laborSeqNo: index + 1,
            rate,
            ...item
          }))
      }

      await postRequest({
        extension: RepairAndServiceRepository.WorkOrderLabors.set2,
        record: JSON.stringify(data)
      })

      toast.success(platformLabels.Updated)
    }
  })

  const columns = [
    {
      component: 'resourcelookup',
      label: labels.labor,
      name: 'laborId',
      props: {
        endpointId: RepairAndServiceRepository.RsLabors.snapshot,
        displayField: 'reference',
        valueField: 'reference',
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'firstName', value: 'First Name' },
          { key: 'lastName', value: 'Last Name' }
        ],
        mapping: [
          { from: 'firstName', to: 'firstName' },
          { from: 'reference', to: 'laborRef' },
          { from: 'lastName', to: 'lastName' },
          { from: 'rate', to: 'rate' },
          { from: 'recordId', to: 'laborId' }
        ],
        displayFieldWidth: 5
      },
      async onChange({ row: { update, newRow } }) {
        update({ rate: newRow.rate || 0 })
      }
    },
    {
      component: 'textfield',
      name: 'firstName',
      label: labels.lastName,
      props: {
        readOnly: true
      }
    },
    {
      component: 'textfield',
      name: 'lastName',
      label: labels.lastName,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'hours',
      label: labels.hours,
      updateOn: 'blur',
      props: {
        decimalScale: 2
      },
      async onChange({ row: { update, newRow } }) {
        update({ total: newRow.hours * newRow.rate || 0 })
      }
    },
    {
      component: 'numberfield',
      name: 'rate',
      label: labels.rate,
      props: {
        readOnly: true
      }
    },
    {
      component: 'numberfield',
      name: 'total',
      label: labels.total,
      props: {
        readOnly: true
      }
    }
  ]

  useEffect(() => {
    ;(async function () {
      if (recordId && seqNo) {
        const response = await getRequest({
          extension: RepairAndServiceRepository.WorkOrderLabors.qry,
          parameters: `_workOrderId=${recordId}&_seqNo=${seqNo}`
        })
        if (response?.list?.length) {
          const data = response.list?.map((item, index) => ({
            ...item,
            id: index + 1
          }))

          formik.setValues({ labors: data })
        }
      }
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access} disabledSubmit={isPosted || isCompleted}>
      <VertLayout>
        <Grow>
          <Fixed>
            <Grid container xs={4} spacing={2}>
              <Grid item xs={12}>
                <CustomTextField name='workOrder' label={labels.workOrder} value={reference} readOnly />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField name='taskName' label={labels.task} value={taskName} readOnly />
              </Grid>
            </Grid>
          </Fixed>
          <Grow>
            <DataGrid
              onChange={value => formik.setFieldValue('labors', value)}
              initialValues={formik.initialValues.labors?.[0]}
              value={formik.values.labors}
              error={formik.errors.labors}
              name='labors'
              columns={columns}
              maxAccess={access}
              disabled={isPosted || isCompleted}
              allowDelete={!isPosted && !isCompleted}
            />
          </Grow>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default LaborsForm
