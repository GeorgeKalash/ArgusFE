import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useContext } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ThreadProgress } from '@argus/shared-ui/src/components/Shared/ThreadProgress'
import Form from '@argus/shared-ui/src/components/Shared/Form'

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
    maxAccess: access,
    validateOnChange: true,
    validationSchema: yup.object({
      startDate: yup.string().required(),
      endDate: yup.string().required()
    }),
    onSubmit: async obj => {
      if (!obj.batchId) {
        delete obj.batchId
        delete obj.batchRef
        delete obj.batchName
      }

      const res = await postRequest({
        extension: api,
        record: JSON.stringify(obj)
      })

      stack({
        Component: ThreadProgress,
        props: {
          recordId: res.recordId
        },
        closable: false
      })

      toast.success(platformLabels.Added)
    }
  })

  const actions = [
    {
      key: 'Locked',
      condition: true,
      onClick: () => formik.handleSubmit(),
      disabled: false
    }
  ]

  return (
    <Form onSave={formik.handleSubmit} actions={actions} isSaved={false} editMode={true} maxAccess={access}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomDatePicker
                name='startDate'
                label={platformLabels.startDate}
                value={formik.values?.startDate}
                required
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('startDate', '')}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
                maxAccess={access}
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
                maxAccess={access}
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
                onChange={(_, newValue) => formik.setFieldValue('plantId', newValue?.recordId || null)}
                error={formik.touched.plantId && Boolean(formik.errors.plantId)}
                maxAccess={access}
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
                displayFieldWidth={2}
                form={formik}
                onChange={(_, newValue) => {
                  formik.setFieldValue('batchId', newValue?.recordId || '')
                  formik.setFieldValue('batchRef', newValue?.reference || '')
                  formik.setFieldValue('batchName', newValue?.name || '')
                }}
                error={formik.touched.batchId && Boolean(formik.errors.batchId)}
                maxAccess={access}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
