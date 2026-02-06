import React, { useContext } from 'react'
import { Grid } from '@mui/material'
import * as yup from 'yup'
import { format } from 'date-fns'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import CustomDatePicker from '@argus/shared-ui/src/components/Inputs/CustomDatePicker'
import toast from 'react-hot-toast'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import CustomTimePicker from '@argus/shared-ui/src/components/Inputs/CustomTimePicker'
import dayjs from 'dayjs'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

export default function GenerateForm({ labels, maxAccess, employeeId, window, onSuccess }) {
  const { postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      employeeId,
      fromDayId: null,
      toDayId: null,
      dayTypeId: null,
      shiftStart: null,
      shiftEnd: null
    },
    validationSchema: yup.object({
      employeeId: yup.number().required(),
      fromDayId: yup.date().required(),
      toDayId: yup.date().required(),
      shiftStart: yup.string().required(),
      shiftEnd: yup.string().required()
    }),
    onSubmit: async values => {
      await postRequest({
        extension: TimeAttendanceRepository.FlatSchedule.range,
        record: JSON.stringify({
          employeeId,
          fromDayId: format(new Date(values.fromDayId), 'yyyyMMdd'),
          toDayId: format(new Date(values.toDayId), 'yyyyMMdd'),
          dayTypeId: values.dayTypeId,
          shiftStart: values.shiftStart ? dayjs(values.shiftStart).format('HH:mm') : '',
          shiftEnd: values.shiftEnd ? dayjs(values.shiftEnd).format('HH:mm') : ''
        })
      })

      if (typeof onSuccess === 'function') {
        onSuccess()
      }

      toast.success(platformLabels.Generated)
      window.close()
    }
  })

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomDatePicker
                name='fromDayId'
                label={labels.fromDate}
                value={formik.values.fromDayId}
                required
                maxAccess={maxAccess}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('fromDayId', null)}
                error={formik.touched.fromDayId && Boolean(formik.errors.fromDayId)}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomDatePicker
                name='toDayId'
                label={labels.toDate}
                value={formik.values.toDayId}
                required
                maxAccess={maxAccess}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('toDayId', null)}
                error={formik.touched.toDayId && Boolean(formik.errors.toDayId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={TimeAttendanceRepository.DayTypes.qry}
                name='dayTypeId'
                label={labels.dayType}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('dayTypeId', newValue?.recordId || null)}
                error={formik.touched.dayTypeId && Boolean(formik.errors.dayTypeId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTimePicker
                label={labels.shiftStart}
                name='shiftStart'
                required
                value={formik.values.shiftStart}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('shiftStart', '')}
                use24Hour
                maxAccess={maxAccess}
                error={formik.touched.shiftStart && Boolean(formik.errors.shiftStart)}
                max={dayjs(formik.values.shiftStart, 'HH:mm')}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTimePicker
                label={labels.shiftEnd}
                name='shiftEnd'
                required
                value={formik.values.shiftEnd}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('shiftEnd', '')}
                use24Hour
                maxAccess={maxAccess}
                error={formik.touched.shiftEnd && Boolean(formik.errors.shiftEnd)}
                max={dayjs(formik.values.shiftEnd, 'HH:mm')}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
