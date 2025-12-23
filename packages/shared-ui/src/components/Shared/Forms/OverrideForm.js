import { Grid } from '@mui/material'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useContext, useEffect, useRef } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useInvalidate } from '@argus/shared-hooks/src/hooks/resource'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import CustomTextArea from '@argus/shared-ui/src/components/Inputs/CustomTextArea'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { formatDateFromApi, formatDateToApi } from '@argus/shared-domain/src/lib/date-helper'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import CustomComboBox from '@argus/shared-ui/src/components/Inputs/CustomComboBox'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { companyStructureRepository } from '@argus/repositories/src/repositories/companyStructureRepository'
import CustomDateTimePicker from '@argus/shared-ui/src/components/Inputs/CustomDateTimePicker'

export default function OverrideForm({ labels, maxAccess, recordId, window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const shiftStore = useRef([])
  dayjs.extend(utc)

  const invalidate = useInvalidate({
    endpointId: TimeAttendanceRepository.TimeVariation.page
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId,
      date: null,
      employeeId: null,
      shiftId: null,
      dataSource: 2,
      timeCode: null,
      punches: '',
      releaseStatus: null,
      clockStamp: null,
      inOut: null,
      udId: null,
      branchId: null
    },
    validationSchema: yup.object({
      employeeId: yup.number().required(),
      date: yup.date().required(),
      timeCode: yup.number().required(),
      branchId: yup.number().required(),
      udId: yup.number().required(),
      shiftId: yup.number().required(),
      inOut: yup.number().required(),
      clockStamp: yup.date().required()
    }),
    onSubmit: async values => {
      await postRequest({
        extension: TimeAttendanceRepository.TimeVariation.override,
        record: JSON.stringify({
          ...values,
          date: formatDateToApi(values.date),
          clockStamp: values.clockStamp ? formatDateToApi(values.clockStamp) : null
        })
      })
      toast.success(platformLabels.Edited)
      invalidate()
      window.close()
    }
  })

  const parseToGmtDate = utc => {
    return new Date(
      utc.getUTCFullYear(),
      utc.getUTCMonth(),
      utc.getUTCDate(),
      utc.getUTCHours(),
      utc.getUTCMinutes(),
      utc.getUTCSeconds()
    )
  }

  async function fillShift(employeeId, date) {
    const { list } = await getRequest({
      extension: TimeAttendanceRepository.FlatSchedule.qry,
      parameters:
        `_params=1|` + employeeId + '^2|' + dayjs(date).format('YYYYMMDD') + '^3|' + dayjs(date).format('YYYYMMDD')
    })

    const shiftData = list?.map(x => {
      const from = dayjs.utc(formatDateFromApi(x.dtFrom)).format('hh:mm A')
      const to = dayjs.utc(formatDateFromApi(x.dtTo)).format('hh:mm A')

      return { ...x, dtRange: `${from} - ${to}` }
    })

    shiftStore.current = shiftData || []

    if (!shiftData?.length) return
    const { recordId, dtTo, dtFrom } = shiftData[0]
    if (formik.values?.timeCode != 20) {
      formik.setFieldValue('shiftId', recordId)
      formik.setFieldValue('dtTo', dtTo ? parseToGmtDate(formatDateFromApi(dtTo)) : null)
      formik.setFieldValue('dtFrom', dtFrom ? parseToGmtDate(formatDateFromApi(dtFrom)) : null)
    }
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        let punches = ''

        const res = await getRequest({
          extension: TimeAttendanceRepository.TimeVariation.get,
          parameters: `_recordId=${recordId}`
        })

        const punchList = await getRequest({
          extension: TimeAttendanceRepository.FlatPunch.qry,
          parameters: `_date=${res?.record?.dayId}&_employeeId=${res?.record?.employeeId}&_sortBy=clockStamp&_shiftId=0&_size=50&_startAt=0`
        })

        punchList?.list?.map(x => {
          punches = dayjs.utc(formatDateFromApi(x.clockStamp)).format('DD/MM/YYYY HH:mm').toString() + '\n'
        })

        formik.setValues({
          ...res.record,
          date: formatDateFromApi(res?.record?.date),
          punches,
          udId: res?.record?.udId || null,
          inOut: res?.record?.inOut || null,
          clockStamp: res?.record?.clockStamp ? parseToGmtDate(formatDateFromApi(res?.record.clockStamp)) : null
        })

        fillShift(res?.record?.employeeId, formatDateFromApi(res?.record?.date))
      }
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={EmployeeRepository.Employee.snapshot}
                parameters={{ _branchId: 0 }}
                valueField='reference'
                displayField='fullName'
                name='employeeId'
                required
                readOnly
                label={labels.employee}
                form={formik}
                displayFieldWidth={2}
                valueShow='employeeRef'
                secondValueShow='employeeName'
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'fullName', value: 'Name' }
                ]}
                maxAccess={maxAccess}
                onChange={(_, newValue) => {
                  formik.setFieldValue('employeeRef', newValue?.reference || '')
                  formik.setFieldValue('employeeName', newValue?.fullName || '')
                  formik.setFieldValue('employeeId', newValue?.recordId || null)
                }}
                errorCheck={'employeeId'}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='date'
                required
                readOnly
                label={labels.date}
                value={formik.values?.date}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('date', null)}
                error={formik.touched.date && Boolean(formik.errors.date)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomComboBox
                name='shiftId'
                label={labels.shift}
                valueField='recordId'
                displayField='dtRange'
                required
                store={shiftStore?.current}
                value={formik.values.shiftId}
                onChange={(_, newValue) => formik.setFieldValue('shiftId', newValue?.recordId || null)}
                error={formik.touched.shiftId && Boolean(formik.errors.shiftId)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='punches'
                label={labels.punches}
                value={formik.values.punches}
                rows={2}
                readOnly
                maxAccess={maxAccess}
                onChange={formik.handleChange}
                onClear={() => formik.setFieldValue('punches', '')}
                error={formik.touched.punches && Boolean(formik.errors.punches)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.TIME_CODE}
                name='timeCode'
                label={labels.timeCode}
                valueField='key'
                displayField='value'
                required
                readOnly
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('timeCode', newValue?.key || null)}
                error={formik.touched.timeCode && Boolean(formik.errors.timeCode)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={companyStructureRepository.BranchFilters.qry}
                name='branchId'
                label={labels.branch}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                required
                maxAccess={maxAccess}
                values={formik.values}
                onChange={(_, newValue) => formik.setFieldValue('branchId', newValue?.recordId || null)}
                error={formik.touched.branchId && Boolean(formik.errors.branchId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={TimeAttendanceRepository.BiometricDevices.qry}
                name='udId'
                label={labels.biometricDevice}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                required
                maxAccess={maxAccess}
                values={formik.values}
                onChange={(_, newValue) => formik.setFieldValue('udId', newValue?.recordId || null)}
                error={formik.touched.udId && Boolean(formik.errors.udId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.CHECK_IN_OUT}
                name='inOut'
                label={labels.checkType}
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                required
                onChange={(_, newValue) => {
                  const { dtFrom, dtTo } = formik.values
                  formik.setFieldValue('clockStamp', newValue?.key == 1 ? dtFrom : newValue?.key == 2 ? dtTo : null)
                  formik.setFieldValue('inOut', newValue?.key || null)
                }}
                error={formik.touched.inOut && Boolean(formik.errors.inOut)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDateTimePicker
                name='clockStamp'
                label={labels.clockStamp}
                value={formik.values.clockStamp}
                onChange={formik.setFieldValue}
                maxAccess={maxAccess}
                formatTime='HH:mm'
                required
                onClear={() => formik.setFieldValue('clockStamp', null)}
                error={formik.touched.clockStamp && Boolean(formik.errors.clockStamp)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
