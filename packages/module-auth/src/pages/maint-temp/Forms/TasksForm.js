import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { RepairAndServiceRepository } from '@argus/repositories/src/repositories/RepairAndServiceRepository'
import { Grid } from '@mui/material'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function TasksForm({ taskInfo, maxAccess, labels, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { templateId, taskId } = taskInfo || {}

  const invalidate = useInvalidate({
    endpointId: RepairAndServiceRepository.MaintenanceTemplateTask.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      templateId,
      taskId,
      tbd: false,
      tbdEvery: null,
      tbdFrequency: null,
      tbdReminder: null,
      tbh: false,
      tbhEvery: null,
      tbhReminder: null,
      expectedLaborHrs: null,
      notes: ''
    },
    validationSchema: yup.object({
      taskId: yup.string().required(),
      tbdEvery: yup
        .number()
        .nullable()
        .min(1)
        .max(32767)
        .test('required-when-tbd', 'tbdEvery is required', function (value) {
          const { tbd } = this.parent

          return !tbd || value
        }),
      tbdReminder: yup
        .number()
        .nullable()
        .min(1)
        .max(32767)
        .test('required-when-tbd', 'tbdReminder is required', function (value) {
          const { tbd } = this.parent

          return !tbd || value
        }),
      tbdFrequency: yup
        .number()
        .nullable()
        .test('required-when-tbd', 'tbdFrequency is required', function (value) {
          const { tbd } = this.parent

          return !tbd || value !== null
        }),
      tbhEvery: yup
        .number()
        .nullable()
        .min(1)
        .max(32767)
        .test('required-when-tbh', 'tbhEvery is required', function (value) {
          const { tbh } = this.parent

          return !tbh || value
        }),
      tbhReminder: yup
        .number()
        .nullable()
        .min(1)
        .max(32767)
        .test('required-when-tbh', 'tbhReminder is required', function (value) {
          const { tbh } = this.parent

          return !tbh || value
        }),
      expectedLaborHrs: yup.number().min(1).max(32767).nullable()
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: RepairAndServiceRepository.MaintenanceTemplateTask.set,
        record: JSON.stringify(obj)
      })
      toast.success(templateId && taskId ? platformLabels.Edited : platformLabels.Saved)
      invalidate()
      window.close()
    }
  })

  useEffect(() => {
    ;(async function () {
      if (templateId && taskId) {
        const res = await getRequest({
          extension: RepairAndServiceRepository.MaintenanceTemplateTask.get,
          parameters: `_templateId=${templateId}&_taskId=${taskId}`
        })
        formik.setValues(res?.record)
      }
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={true}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RepairAndServiceRepository.PreventiveMaintenanceTasks.qry}
                name='taskId'
                label={labels.name}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                required
                readOnly={taskId}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('taskId', newValue?.recordId || null)
                }}
                error={formik.touched.taskId && Boolean(formik.errors.taskId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='tbd'
                value={formik.values?.tbd}
                onChange={event => {
                  formik.setFieldValue('tbdEvery', null)
                  formik.setFieldValue('tbdReminder', null)
                  formik.setFieldValue('tbdFrequency', null)
                  formik.setFieldValue('tbd', event.target.checked)
                }}
                label={labels.trackByDate}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomNumberField
                name='tbdEvery'
                label={labels.due}
                value={formik?.values?.tbdEvery}
                maxAccess={maxAccess}
                readOnly={!formik?.values?.tbd}
                required={formik?.values?.tbd}
                onChange={formik.handleChange}
                allowNegative={false}
                onClear={() => formik.setFieldValue('tbdEvery', null)}
                error={formik.touched.tbdEvery && Boolean(formik.errors.tbdEvery)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                datasetId={DataSets.RS_FREQUENCY}
                label={labels.frequency}
                name='tbdFrequency'
                values={formik.values}
                valueField='key'
                displayField='value'
                maxAccess={maxAccess}
                readOnly={!formik?.values?.tbd}
                required={formik?.values?.tbd}
                onChange={(event, newValue) => {
                  formik.setFieldValue('tbdFrequency', newValue?.key || null)
                }}
                error={formik.touched.tbdFrequency && Boolean(formik.errors.tbdFrequency)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='tbdReminder'
                label={labels.reminder}
                value={formik?.values?.tbdReminder}
                maxAccess={maxAccess}
                readOnly={!formik?.values?.tbd}
                required={formik?.values?.tbd}
                allowNegative={false}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('tbdReminder', null)}
                error={formik.touched.tbdReminder && Boolean(formik.errors.tbdReminder)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='tbh'
                value={formik.values?.tbh}
                onChange={event => {
                  formik.setFieldValue('tbhEvery', null)
                  formik.setFieldValue('tbhReminder', null)
                  formik.setFieldValue('tbh', event.target.checked)
                }}
                label={labels.trackByHours}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='tbhEvery'
                label={labels.due}
                value={formik?.values?.tbhEvery}
                maxAccess={maxAccess}
                readOnly={!formik?.values?.tbh}
                required={formik?.values?.tbh}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('tbhEvery', null)}
                error={formik.touched.tbhEvery && Boolean(formik.errors.tbhEvery)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='tbhReminder'
                label={labels.reminder}
                value={formik?.values?.tbhReminder}
                maxAccess={maxAccess}
                readOnly={!formik?.values?.tbh}
                required={formik?.values?.tbh}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('tbhReminder', null)}
                error={formik.touched.tbhReminder && Boolean(formik.errors.tbhReminder)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='expectedLaborHrs'
                label={labels.labor}
                value={formik?.values?.expectedLaborHrs}
                maxAccess={maxAccess}
                allowNegative={false}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('expectedLaborHrs', null)}
                error={formik.touched.expectedLaborHrs && Boolean(formik.errors.expectedLaborHrs)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='notes'
                label={labels.notes}
                value={formik?.values?.notes}
                maxAccess={maxAccess}
                rows={3}
                maxLength='300'
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('notes', '')}
                error={formik.touched.header?.notes && Boolean(formik.errors.header?.notes)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
