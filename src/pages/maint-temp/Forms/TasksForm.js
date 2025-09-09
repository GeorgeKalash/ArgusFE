import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useInvalidate } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { RepairAndServiceRepository } from 'src/repositories/RepairAndServiceRepository'
import { Grid } from '@mui/material'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'

export default function TasksForm({ taskInfo, maxAccess, labels }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { templateId: recordId, taskId } = taskInfo || {}

  const invalidate = useInvalidate({
    endpointId: RepairAndServiceRepository.MaintenanceTemplateTask.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: null,
      namePMT: null,
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
      namePMT: yup.string().required(),
      tbdEvery: yup.number().min(1).required(),
      tbdReminder: yup.number().min(1).required(),
      tbhEvery: yup.number().min(1).required(),
      tbhReminder: yup.number().min(1).required(),
      expectedLaborHrs: yup.number().min(1).required()
    }),
    onSubmit: async obj => {
      const response = await postRequest({
        extension: RepairAndServiceRepository.MaintenanceTemplateTask.set,
        record: JSON.stringify(obj)
      })

      toast.success(obj.recordId ? platformLabels.Edited : platformLabels.Added)
      if (!obj.recordId) formik.setFieldValue('recordId', response.recordId)
      setStore(prevStore => ({
        ...prevStore,
        recordId: response.recordId
      }))
      invalidate()
      window.close()
    }
  })
  const editMode = !!formik?.values?.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: RepairAndServiceRepository.MaintenanceTemplateTask.get,
          parameters: `_templateId=${recordId}&_taskId=${taskId}`
        })
        formik.setValues(res?.record)
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.MaintenanceTemplates} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {/* <ResourceComboBox
                endpointId={LogisticsRepository.LoCarrier.qry}
                name='namePMT'
                label={labels.name}
                values={formik.values}
                valueField='recordId'
                displayField='name'
                required
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('namePMT', newValue?.recordId || null)
                }}
                error={formik.touched.namePMT && Boolean(formik.errors.namePMT)}
              /> */}
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='tbd'
                value={formik.values?.tbd}
                onChange={event => formik.setFieldValue('tbd', event.target.checked)}
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
                readOnly={!formik.values.tbd}
                required={formik.values.tbd}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('tbdEvery', null)}
                error={formik.touched.tbdEvery && Boolean(formik.errors.tbdEvery)}
              />
            </Grid>
            <Grid item xs={6}>
              <ResourceComboBox
                datasetId={DataSets.RS_FREQUENCY}
                label={''}
                name='tbdFrequency'
                values={formik.values}
                valueField='key'
                displayField='value'
                maxAccess={maxAccess}
                readOnly={!formik.values.tbd}
                required={formik.values.tbd}
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
                readOnly={!formik.values.tbd}
                required={formik.values.tbd}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('tbdReminder', null)}
                error={formik.touched.tbdReminder && Boolean(formik.errors.tbdReminder)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='tbh'
                value={formik.values?.tbh}
                onChange={event => formik.setFieldValue('tbh', event.target.checked)}
                label={labels.trackByHour}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='tbhEvery'
                label={labels.due}
                value={formik?.values?.tbhEvery}
                maxAccess={maxAccess}
                readOnly={!formik.values.tbh}
                required={formik.values.tbh}
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
                readOnly={!formik.values.tbh}
                required={formik.values.tbh}
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
                readOnly={!formik.values.tbh}
                required={formik.values.tbh}
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
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('notes', '')}
                error={formik.touched.header?.notes && Boolean(formik.errors.header?.notes)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
