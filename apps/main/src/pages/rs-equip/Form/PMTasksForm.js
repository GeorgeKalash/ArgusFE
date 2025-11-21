import { Grid, Typography } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { RepairAndServiceRepository } from '@argus/repositories/src/repositories/RepairAndServiceRepository'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function EquipmentTaskForm({ labels, maxAccess, recordId, pmtId, window }) {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  const invalidate = useInvalidate({
    endpointId: RepairAndServiceRepository.EquipmentType.qry
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId,
      pmtId,
      activeStatus: null,
      tbd: false,
      tbdFrequency: null,
      tbdEvery: null,
      tbdReminder: null,
      tbh: false,
      tbhEvery: null,
      tbhReminder: null,
      expectedLaborHrs: null,
      notes: ''
    },
    validationSchema: yup.object({
      pmtId: yup.number().required(),
      activeStatus: yup.number().required(),
      tbhEvery: yup.string().when('tbh', {
        is: true,
        then: () => yup.number().required(),
        otherwise: () => yup.number().nullable()
      }),
      tbhReminder: yup.number().when('tbh', {
        is: true,
        then: () => yup.number().required(),
        otherwise: () => yup.number().nullable()
      }),
      tbdEvery: yup.string().when('tbd', {
        is: true,
        then: () => yup.number().required(),
        otherwise: () => yup.number().nullable()
      }),
      tbdReminder: yup.string().when('tbd', {
        is: true,
        then: () => yup.number().required(),
        otherwise: () => yup.number().nullable()
      }),
      tbdFrequency: yup.number().when('tbd', {
        is: true,
        then: () => yup.number().required(),
        otherwise: () => yup.number().nullable()
      })
    }),
    onSubmit: async values => {
      await postRequest({
        extension: RepairAndServiceRepository.EquipmentType.set,
        record: JSON.stringify({
          ...values,
          equipmentId: recordId
        })
      }).then(res => {
        formik.setFieldValue('recordId', res.recordId)
        toast.success(!values.recordId ? platformLabels.Added : platformLabels.Edited)

        invalidate()
        window.close()
      })
    }
  })

  const editMode = !!formik?.values?.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId && pmtId) {
        const res = await getRequest({
          extension: RepairAndServiceRepository.EquipmentType.get,
          parameters: `_equipmentId=${recordId}&_pmtId=${pmtId}`
        })
        formik.setValues(res.record)
      }
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={RepairAndServiceRepository.PreventiveMaintenanceTasks.qry}
              name='pmtId'
              label={labels.name}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              required
              onChange={(event, newValue) => {
                formik.setFieldValue('pmtId', newValue?.recordId || null)
              }}
              error={formik.touched.pmtId && Boolean(formik.errors.pmtId)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              name='activeStatus'
              label={labels.activeStatus}
              datasetId={DataSets.ACTIVE_STATUS}
              values={formik.values}
              valueField='key'
              displayField='value'
              onChange={(event, newValue) => {
                formik.setFieldValue('activeStatus', newValue?.key || null)
              }}
              required
              error={formik.touched.activeStatus && Boolean(formik.errors.activeStatus)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomCheckBox
              name='tbd'
              value={formik.values.tbd}
              onChange={event => {
                formik.setFieldValue('tbd', event.target.checked)
                if (!event.target.checked) {
                  formik.setFieldValue('tbdEvery', null)
                  formik.setFieldValue('tbdReminder', null)
                  formik.setFieldValue('tbdFrequency', null)
                }
              }}
              label={labels.tbd}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomNumberField
              name='tbdEvery'
              label={labels.due}
              value={formik.values.tbdEvery}
              onChange={formik.handleChange}
              decimalScale={0}
              maxLength={4}
              allowNegative={false}
              required={formik.values.tbd}
              readOnly={!formik.values.tbd}
              onClear={() => formik.setFieldValue('tbdEvery', null)}
              error={formik.values.tbd && formik.touched.tbdEvery && Boolean(formik.errors.tbdEvery)}
            />
          </Grid>
          <Grid item xs={6}>
            <ResourceComboBox
              datasetId={DataSets.RS_FREQUENCY}
              name='tbdFrequency'
              valueField='key'
              displayField='value'
              values={formik.values}
              required={formik.values.tbd}
              readOnly={!formik.values.tbd}
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                formik.setFieldValue('tbdFrequency', newValue?.key || 1)
              }}
              error={formik.values.tbd && formik.touched.tbdFrequency && Boolean(formik.errors.tbdFrequency)}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomNumberField
              name='tbdReminder'
              label={labels.reminder}
              value={formik.values.tbdReminder}
              onChange={formik.handleChange}
              required={formik.values.tbd}
              readOnly={!formik.values.tbd}
              decimalScale={0}
              maxLength={4}
              allowNegative={false}
              onClear={() => formik.setFieldValue('tbdReminder', null)}
              error={formik.values.tbd && formik.touched.tbdReminder && Boolean(formik.errors.tbdReminder)}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography>{labels.Days}</Typography>
          </Grid>
          <Grid item xs={12}>
            <CustomCheckBox
              name='tbh'
              value={formik.values.tbh}
              onChange={event => {
                formik.setFieldValue('tbh', event.target.checked)
                if (!event.target.checked) {
                  formik.setFieldValue('tbhEvery', null)
                  formik.setFieldValue('tbhReminder', null)
                }
              }}
              label={labels.tbh}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={6}>
            <CustomNumberField
              name='tbhEvery'
              label={labels.due}
              value={formik.values.tbhEvery}
              onChange={formik.handleChange}
              required={formik.values.tbh}
              decimalScale={0}
              maxLength={4}
              allowNegative={false}
              readOnly={!formik.values.tbh}
              onClear={() => formik.setFieldValue('tbhEvery', null)}
              error={formik.values.tbh && formik.touched.tbhEvery && Boolean(formik.errors.tbhEvery)}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography>{labels.Hours}</Typography>
          </Grid>
          <Grid item xs={6}>
            <CustomNumberField
              name='tbhReminder'
              label={labels.reminder}
              value={formik.values.tbhReminder}
              onChange={formik.handleChange}
              decimalScale={0}
              maxLength={4}
              allowNegative={false}
              required={formik.values.tbh}
              readOnly={!formik.values.tbh}
              onClear={() => formik.setFieldValue('tbhReminder', null)}
              error={formik.values.tbh && formik.touched.tbhReminder && Boolean(formik.errors.tbhReminder)}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography>{labels.Hours}</Typography>
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='expectedLaborHrs'
              label={labels.labor}
              value={formik.values.expectedLaborHrs}
              onChange={formik.handleChange}
              decimalScale={0}
              maxLength={4}
              allowNegative={false}
              onClear={() => formik.setFieldValue('expectedLaborHrs', null)}
              error={formik.touched.expectedLaborHrs && Boolean(formik.errors.expectedLaborHrs)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='notes'
              label={labels.notes}
              value={formik.values.notes}
              rows={3}
              maxAccess={maxAccess}
              onChange={e => formik.setFieldValue('notes', e.target.value)}
              onClear={() => formik.setFieldValue('notes', '')}
              error={formik.touched.notes && Boolean(formik.errors.notes)}
            />
          </Grid>
        </Grid>
      </VertLayout>
    </Form>
  )
}
