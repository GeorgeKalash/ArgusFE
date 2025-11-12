import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useContext, useEffect, useRef } from 'react'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { useInvalidate } from 'src/hooks/resource'
import { useForm } from 'src/hooks/form'
import { ControlContext } from 'src/providers/ControlContext'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { TimeAttendanceRepository } from 'src/repositories/TimeAttendanceRepository'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { DataSets } from 'src/resources/DataSets'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { formatDateFromApi, formatDateMDY, formatDateToApi } from 'src/lib/date-helper'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import { SystemFunction } from 'src/resources/SystemFunction'
import Form from 'src/components/Shared/Form'
import { companyStructureRepository } from 'src/repositories/companyStructureRepository'
import CustomDateTimePicker from 'src/components/Inputs/CustomDateTimePicker'

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
      reference: '',
      date: new Date(),
      employeeId: null,
      dataSource: 2,
      timeCode: 20,
      duration: 0,
      damageLevel: null,
      punches: '',
      releaseStatus: null,
      wip: 1,
      status: 1
    },
    validationSchema: yup.object({
      employeeId: yup.number().required(),
      date: yup.date().required(),
      timeCode: yup.number().required(),
      damageLevel: yup.number().required()
    }),
    onSubmit: async values => {
      await postRequest({
        extension: TimeAttendanceRepository.TimeVariation.gen,
        record: JSON.stringify({ ...values, date: formatDateToApi(values.date) })
      })
      toast.success(!values.recordId ? platformLabels.Added : platformLabels.Edited)
      invalidate()
      window.close()
    }
  })

  async function getShiftData(employeeId, date) {
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

    return shiftData || []
  }

  async function fillShift(employeeId, date, timeCode) {
    if (!employeeId) {
      resetShiftFields()

      return
    }
    const shiftData = await getShiftData(employeeId, date)

    if (!shiftData?.length) {
      resetShiftFields()

      return
    }

    const { recordId, duration } = shiftData[0]
    if (timeCode != 20) {
      formik.setFieldValue('shiftId', recordId)
    }
  }

  async function updateTerminationDate(employeeId) {
    if (!employeeId) {
      formik.setFieldValue('terminationDate', null)

      return
    }

    const res = await getRequest({
      extension: EmployeeRepository.QuickView.get,
      parameters: `_recordId=${employeeId}&_asOfDate=${formatDateMDY(new Date())}`
    })
    formik.setFieldValue('terminationDate', res?.record?.terminationDate || null)
  }

  function resetShiftFields() {
    formik.setFieldValue('shiftId', null)
  }

  async function refetchForm(recordId) {
    if (!recordId) return

    const res = await getRequest({
      extension: TimeAttendanceRepository.TimeVariation.get,
      parameters: `_recordId=${recordId}`
    })
    formik.setValues({
      ...res.record,
      date: formatDateFromApi(res?.record?.date)
    })

    return res
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await refetchForm(recordId)
        getShiftData(res?.record?.employeeId, formatDateFromApi(res?.record?.date))
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
                onChange={async (_, newValue) => {
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
                store={shiftStore?.current}
                value={formik.values.shiftId}
                readOnly={formik.values?.timeCode == 20}
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
                values={formik.values}
                maxAccess={maxAccess}
                onChange={async (_, newValue) => formik.setFieldValue('timeCode', newValue?.key || null)}
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
                onChange={async (_, newValue) => formik.setFieldValue('inOut', newValue?.key || null)}
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
