import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { CommonContext } from '@argus/shared-providers/src/providers/CommonContext'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import CustomTimePicker from '@argus/shared-ui/src/components/Inputs/CustomTimePicker'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import dayjs from 'dayjs'

export default function ResourceDowntimeForm({ labels, maxAccess, recordId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  const invalidate = useInvalidate({
    endpointId: AccessControlRepository.ResourceDowntime.page
  })

  const { formik } = useForm({
    initialValues: {
      recordId: null,
      name: '',
      timeFrom: '',
      timeTo: '',
      type: null,
      moduleId: null,
      resourceId: null,
      sgId: null,
      isInactive: false,
      flags: []
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required(),
      type: yup.number().required(),
      timeFrom: yup
        .mixed()
        .required()
        .test('before-timeTo', 'timeFrom must be before timeTo', function (value) {
          const { timeTo } = this.parent
          if (!value || !timeTo) return true

          return dayjs(value).isBefore(dayjs(timeTo))
        }),

      timeTo: yup
        .mixed()
        .required()
        .test('after-timeFrom', 'timeTo must be after timeFrom', function (value) {
          const { timeFrom } = this.parent
          if (!value || !timeFrom) return true

          return dayjs(value).isAfter(dayjs(timeFrom))
        }),

      flags: yup
        .array()
        .of(
          yup.object({
            weekday: yup.string().required(),
            weekdayName: yup.string().required(),
            flag: yup.boolean().required()
          })
        )
        .test('at-least-one-checked', 'At least one weekday must be selected.', function (value) {
          return Array.isArray(value) && value.some(day => day.flag === true)
        })
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: AccessControlRepository.ResourceDowntime.set2,
        record: JSON.stringify({
          ...obj,
          timeFrom: obj.timeFrom ? dayjs(obj.timeFrom).format('HH:mm') : '',
          timeTo: obj.timeTo ? dayjs(obj.timeTo).format('HH:mm') : ''
        })
      }).then(async res => {
        toast.success(obj?.recordId ? platformLabels.Edited : platformLabels.Added)
        !obj.recordId && formik.setFieldValue('recordId', res.recordId)
        invalidate()
      })
    }
  })

  const editMode = !!formik.values.recordId

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: AccessControlRepository.ResourceDowntime.get2,
          parameters: `_recordId=${recordId}`
        })

        formik.setValues({
          ...res.record,
          timeFrom: dayjs(res.record.timeFrom, 'HH:mm'),
          timeTo: dayjs(res.record.timeTo, 'HH:mm')
        })
      } else {
        await getAllKvsByDataset({
          _dataset: DataSets.WEEK_DAY,
          callback: res => {
            if (res.length > 0) {
              formik.setFieldValue(
                'flags',
                res.map(item => ({
                  weekday: item.key,
                  weekdayName: item.value,
                  flag: false
                }))
              )
            }
          }
        })
      }
    })()
  }, [])

  return (
    <FormShell resourceId={ResourceIds.ResourceDowntime} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={formik.values.name}
                required
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('name', '')}
                error={formik.touched.name && Boolean(formik.errors.name)}
              />
            </Grid>
            {formik?.values?.flags?.map((day, index) => (
              <Grid item xs={6} key={day.weekday}>
                <CustomCheckBox
                  name={`flags.${index}.flag`}
                  value={day.flag}
                  onChange={event => formik.setFieldValue(`flags.${index}.flag`, event.target.checked)}
                  label={day.weekdayName}
                  maxAccess={maxAccess}
                  required
                  error={Boolean(formik.errors.flags) && formik.touched.flags}
                />
              </Grid>
            ))}
            <Grid item xs={6}></Grid>
            <Grid item xs={6}>
              <CustomTimePicker
                label={labels.timeFrom}
                name='timeFrom'
                required
                value={formik.values.timeFrom}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('timeFrom', '')}
                use24Hour
                maxAccess={maxAccess}
                error={formik.touched.timeFrom && Boolean(formik.errors.timeFrom)}
                max={dayjs(formik.values.timeTo, 'HH:mm')}
              />
            </Grid>
            <Grid item xs={6}>
              <CustomTimePicker
                label={labels.timeTo}
                name='timeTo'
                required
                value={formik.values.timeTo}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('timeTo', '')}
                use24Hour
                maxAccess={maxAccess}
                error={formik.touched.timeTo && Boolean(formik.errors.timeTo)}
                min={dayjs(formik.values.timeFrom, 'HH:mm')}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.RESOURCE_DOWNTIME_TYPE}
                label={labels.type}
                defaultIndex={0}
                required
                name='type'
                values={formik.values}
                valueField='key'
                displayField='value'
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('type', newValue?.key || null)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.MODULE}
                label={labels.module}
                name='moduleId'
                values={formik.values}
                valueField='key'
                displayField='value'
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('moduleId', newValue?.key || null)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.ModuleClassRES.qry}
                parameters={`_moduleId=${formik.values.moduleId || 0}&_filter=`}
                label={labels.resource}
                name='resourceId'
                values={formik.values}
                maxAccess={maxAccess}
                valueField='key'
                displayField='value'
                onChange={(_, newValue) => formik.setFieldValue('resourceId', newValue?.key || null)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={AccessControlRepository.SecurityGroup.qry}
                parameters='_startAt=0&_pageSize=1000'
                label={labels.SecurityGroup}
                name='sgId'
                values={formik.values}
                maxAccess={maxAccess}
                valueField='recordId'
                displayField='name'
                onChange={(_, newValue) => formik.setFieldValue('sgId', newValue?.recordId || null)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomCheckBox
                name='isInactive'
                value={formik.values.isInactive}
                onChange={event => formik.setFieldValue('isInactive', event.target.checked)}
                label={labels.isInactive}
                maxAccess={maxAccess}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
