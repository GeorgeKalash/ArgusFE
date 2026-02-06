import { Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import toast from 'react-hot-toast'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import * as yup from 'yup'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const AttSettings = () => {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData } = useContext(ControlContext)

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.AttendanceSettings
  })

  useEffect(() => {
    ;(async function () {
      const myObject = {}

      const filteredList = defaultsData?.list?.filter(obj => {
        return (
          obj.key === 'caId' ||
          obj.key === 'fdowCombo' ||
          obj.key === 'lastGenFSDateTime' ||
          obj.key === 'lastReceivedPunch' ||
          obj.key === 'lastProcessedPunch' ||
          obj.key === 'lastGenTATV' ||
          obj.key === 'sourceTASC' ||
          obj.key === 'sourceTACA' ||
          obj.key === 'minPunchInterval' ||
          obj.key === 'dailySchedule' ||
          obj.key === 'punchSource' ||
          obj.key === 'weeklyTAHours' ||
          obj.key === 'prevDayTVTime' ||
          obj.key === 'disableCrossBranchTA'
        )
      })
      filteredList?.forEach(obj => {
        if (obj.key === 'disableCrossBranchTA') {
          myObject[obj.key] = obj.value || null
        } else {
          myObject[obj.key] = obj.value ? parseInt(obj.value, 10) : null
        }
      })
      formik.setValues(myObject)
    })()
  }, [defaultsData])

  const { formik } = useForm({
    maxAccess: access,
    validateOnChange: true,
    initialValues: {
      caId: null,
      fdowCombo: null,
      lastGenFSDateTime: null,
      lastReceivedPunch: null,
      lastProcessedPunch: null,
      lastGenTATV: null,
      sourceTASC: null,
      sourceTACA: null,
      minPunchInterval: null,
      dailySchedule: null,
      punchSource: null,
      weeklyTAHours: null,
      prevDayTVTime: null,
      disableCrossBranchTA: null
    },
    validationSchema: yup.object().shape({
      prevDayTVTime: yup.number().min(7).max(15).nullable(),
      minPunchInterval: yup.number().min(5).max(15).nullable()
    }),
    onSubmit: async obj => {
      const data = Object.entries(obj).map(([key, value]) => ({
        key,
        value
      }))

      await postRequest({
        extension: SystemRepository.Defaults.set,
        record: JSON.stringify({ sysDefaults: data })
      })

      toast.success(platformLabels.Edited)
    }
  })

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access}>
      <VertLayout>
        <Grid container spacing={2} xs={5}>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={TimeAttendanceRepository.Calendar.qry}
              name='caId'
              label={labels.caId}
              values={formik.values}
              valueField='recordId'
              displayField='name'
              maxAccess={access}
              onChange={(event, newValue) => {
                formik.setFieldValue('caId', newValue?.recordId || null)
              }}
              error={formik.touched.caId && Boolean(formik.errors.caId)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.WEEK_DAY}
              name='fdowCombo'
              label={labels.fdowCombo}
              valueField='key'
              displayField='value'
              values={formik.values}
              maxAccess={access}
              onChange={(event, newValue) => {
                formik.setFieldValue('fdowCombo', newValue?.key || null)
              }}
              error={formik.touched.fdowCombo && Boolean(formik.errors.fdowCombo)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='lastGenFSDateTime'
              readOnly
              label={labels.lastGenFSDateTime}
              value={formik.values?.lastGenFSDateTime}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='lastReceivedPunch'
              readOnly
              label={labels.lastReceivedPunch}
              value={formik.values?.lastReceivedPunch}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='lastProcessedPunch'
              readOnly
              label={labels.lastProcessedPunch}
              value={formik.values?.lastProcessedPunch}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='lastGenTATV'
              label={labels.lastGenTATV}
              value={formik.values.lastGenTATV}
              maxAccess={access}
              readOnly
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('lastGenTATV', '')}
              error={formik.touched.lastGenTATV && Boolean(formik.errors.lastGenTATV)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.SOURCE_ATTENDANCE_SCHEDULE}
              name='sourceTASC'
              label={labels.sourceTASC}
              valueField='key'
              displayField='value'
              values={formik.values}
              maxAccess={access}
              onChange={(event, newValue) => {
                formik.setFieldValue('sourceTASC', newValue?.key || null)
              }}
              error={formik.touched.sourceTASC && Boolean(formik.errors.sourceTASC)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.SOURCE_CALENDAR}
              name='sourceTACA'
              label={labels.sourceTACA}
              valueField='key'
              displayField='value'
              values={formik.values}
              maxAccess={access}
              onChange={(event, newValue) => {
                formik.setFieldValue('sourceTACA', newValue?.key || null)
              }}
              error={formik.touched.sourceTACA && Boolean(formik.errors.sourceTACA)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='minPunchInterval'
              label={labels.minPunchInterval}
              value={formik.values.minPunchInterval}
              maxAccess={access}
              thousandSeparator={false}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('minPunchInterval', null)}
              error={formik.touched.minPunchInterval && Boolean(formik.errors.minPunchInterval)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.DAILY_SCHEDULE}
              name='dailySchedule'
              label={labels.dailySchedule}
              valueField='key'
              displayField='value'
              values={formik.values}
              maxAccess={access}
              onChange={(event, newValue) => {
                formik.setFieldValue('dailySchedule', newValue?.key || null)
              }}
              error={formik.touched.dailySchedule && Boolean(formik.errors.dailySchedule)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.PUNCH_SOURCE}
              name='punchSource'
              label={labels.punchSource}
              valueField='key'
              displayField='value'
              values={formik.values}
              maxAccess={access}
              onChange={(event, newValue) => {
                formik.setFieldValue('punchSource', newValue?.key || null)
              }}
              error={formik.touched.punchSource && Boolean(formik.errors.punchSource)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='weeklyTAHours'
              label={labels.weeklyTAHours}
              value={formik.values.weeklyTAHours}
              maxAccess={access}
              thousandSeparator={false}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('weeklyTAHours', null)}
              error={formik.touched.weeklyTAHours && Boolean(formik.errors.weeklyTAHours)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomNumberField
              name='prevDayTVTime'
              label={labels.prevDayTVTime}
              value={formik.values.prevDayTVTime}
              maxAccess={access}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('prevDayTVTime', null)}
              error={formik.touched.prevDayTVTime && Boolean(formik.errors.prevDayTVTime)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomCheckBox
              name='disableCrossBranchTA'
              value={formik.values.disableCrossBranchTA}
              onChange={event => formik.setFieldValue('disableCrossBranchTA', event.target.checked)}
              label={labels.disableCrossBranchTA}
              maxAccess={access}
            />
          </Grid>
        </Grid>
      </VertLayout>
    </Form>
  )
}

export default AttSettings
