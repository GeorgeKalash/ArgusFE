import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { ControlContext } from 'src/providers/ControlContext'
import { useWindow } from 'src/windows'
import { ThreadProgress } from 'src/components/Shared/ThreadProgress'

export default function BatchPostForm({ access }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const query = new URLSearchParams(window.location.search)
  const api = query.get('api')
  const status = query.get('status')

  const today = new Date()

  const newStartDate = new Date()
  newStartDate.setMonth(0)
  newStartDate.setDate(1)

  const { formik } = useForm({
    initialValues: {
      startDate: newStartDate,
      endDate: today,
      status: parseInt(status)
    },
    enableReinitialize: false,
    maxAccess: access,
    validateOnChange: true,
    validationSchema: yup.object({
      startDate: yup.string().required(),
      endDate: yup.string().required()
    }),
    onSubmit: async obj => {
      try {
        const res = await postRequest({
          extension: api,
          record: JSON.stringify(obj)
        })

        stack({
          Component: ThreadProgress,
          props: {
            recordId: res.recordId
          },
          width: 500,
          height: 450,
          closable: false,
          title: platformLabels.Progress
        })

        toast.success(platformLabels.Added)
        formik.setValues(obj)

        invalidate()
      } catch (error) {}
    }
  })

  const actions = [
    {
      key: 'Post',
      condition: true,
      onClick: () => formik.handleSubmit(),
      disabled: false
    }
  ]

  return (
    <FormShell form={formik} actions={actions} isSaved={false} editMode={true} isInfo={false} isCleared={false}>
      <VertLayout>
        <Grow>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <CustomDatePicker
                name='startDate'
                label={platformLabels.startDate}
                value={formik.values?.startDate}
                required
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('startDate', '')}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='endDate'
                label={platformLabels.endDate}
                value={formik.values?.endDate}
                required
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('endDate', '')}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Plant.qry}
                name='plantId'
                label={platformLabels.plant}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'plant Ref' },
                  { key: 'name', value: 'Name' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  if (newValue?.recordId) {
                    formik.setFieldValue('plantId', newValue?.recordId)
                  } else {
                    delete formik?.values?.plantId
                  }
                }}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={SystemRepository.Batch.snapshot}
                parameters={{
                  _sortBy: 'recordId desc',
                  _functionId: 5102
                }}
                name='batchId'
                label={platformLabels.batch}
                valueField='reference'
                displayField='name'
                valueShow='batchRef'
                secondValueShow='batchName'
                form={formik}
                onChange={(event, newValue) => {
                  if (newValue?.recordId) {
                    formik.setFieldValue('batchId', newValue?.recordId)
                  }
                  formik.setFieldValue('batchRef', newValue?.reference || '')
                  formik.setFieldValue('batchName', newValue?.name || '')
                }}
                error={formik.touched.batchId && Boolean(formik.errors.batchId)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
