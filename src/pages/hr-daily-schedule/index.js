import React, { useState, useContext } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import arLocale from '@fullcalendar/core/locales/ar'
import enLocale from '@fullcalendar/core/locales/en-gb'
import interactionPlugin from '@fullcalendar/interaction'
import { Grid } from '@mui/material'
import toast from 'react-hot-toast'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomButton from 'src/components/Inputs/CustomButton'
import * as yup from 'yup'
import { RequestsContext } from 'src/providers/RequestsContext'
import { TimeAttendanceRepository } from 'src/repositories/TimeAttendanceRepository'
import { useForm } from 'src/hooks/form'
import { useWindow } from 'src/windows'
import ImportExportRangeForm from './Form/ImportAndExportForm'
import Form from 'src/components/Shared/Form'
import GenerateForm from './Form/GenerateForm'
import { ControlContext } from 'src/providers/ControlContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { AuthContext } from 'src/providers/AuthContext'

export const ImportExportMode = {
  IMPORT: 'import',
  EXPORT: 'export'
}

export default function Calendar() {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const [events, setEvents] = useState([])
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const { user } = useContext(AuthContext)

  const { labels, access } = useResourceQuery({
    datasetId: ResourceIds.DailySchedules
  })

  const formatDate = date => {
    if (!date) return ''
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')

    return `${year}${month}${day}`
  }

  const toUTCString = date => {
    const utcHours = date.getUTCHours().toString().padStart(2, '0')
    const utcMinutes = date.getUTCMinutes().toString().padStart(2, '0')

    return `${utcHours}:${utcMinutes}`
  }

  const { formik } = useForm({
    initialValues: {
      employeeId: null,
      employeeRef: '',
      employeeName: '',
      fromDate: null,
      toDate: null
    },
    validationSchema: yup.object({
      employeeId: yup.number().required(),
      fromDate: yup.date().required(),
      toDate: yup.date().required()
    }),
    onSubmit: async values => {
      const formattedFrom = formatDate(values.fromDate)
      const formattedTo = formatDate(values.toDate)

      const data = await getRequest({
        extension: TimeAttendanceRepository.FlatSchedule.qry2,
        parameters: `_employeeId=${values.employeeId}&fromDayId=${formattedFrom}&toDayId=${formattedTo}`
      })

      const formattedEvents = data.list.map(item => {
        const start = new Date(parseInt(item?.dtFrom.match(/\d+/)[0], 10))
        const end = new Date(parseInt(item.dtTo.match(/\d+/)[0], 10))

        const title = `${toUTCString(start)} - ${toUTCString(end)}`

        return {
          title,
          start: new Date(parseInt(item.dtFrom.match(/\d+/)[0])),
          end: new Date(parseInt(item.dtTo.match(/\d+/)[0])),
          allDay: false,
          display: 'block',
          backgroundColor: '#a5d6a7',
          borderColor: '#81c784',
          textColor: '#000'
        }
      })

      setEvents(formattedEvents)
    }
  })

  const onImportExport = async mode => {
    stack({
      Component: ImportExportRangeForm,
      props: {
        mode,
        values: formik.values,
        labels,
        maxAccess: access
      },
      width: 500,
      height: 350,
      title: mode === ImportExportMode.IMPORT ? platformLabels.import : platformLabels.Export
    })
  }

  const onGenerate = async () => {
    const { employeeId, fromDate, toDate } = formik.values

    stack({
      Component: GenerateForm,
      props: {
        employeeId,
        labels,
        maxAccess: access,
        ...(fromDate && toDate ? { onSuccess: () => formik.handleSubmit() } : {})
      },
      width: 500,
      height: 400,
      title: platformLabels.Generate
    })
  }

  const onDelete = async () => {
    const payload = {
      employeeId: formik.values.employeeId,
      startDate: formik.values.fromDate,
      endDate: formik.values.toDate
    }

    await postRequest({
      extension: TimeAttendanceRepository.FlatSchedule.del,
      record: JSON.stringify(payload)
    })

    formik.handleSubmit()
    toast.success(platformLabels.Deleted)
    window.close()
  }

  return (
    <>
      <style>
        {`
          .fc .fc-button-primary {
            background-color: #000;
            border-color: #000;
            color: white;
          }
        `}
      </style>
      <Form onSave={formik.handleSubmit} isSaved={false}>
        <VertLayout>
          <Grow>
            <Grid container spacing={2} paddingBottom={2}>
              <Grid item xs={3}>
                <ResourceLookup
                  endpointId={EmployeeRepository.Employee.snapshot}
                  parameters={{ _branchId: 0 }}
                  form={formik}
                  valueField='reference'
                  displayField='fullName'
                  name='employeeRef'
                  label={labels.employee}
                  maxAccess={access}
                  valueShow='employeeRef'
                  secondValueShow='employeeName'
                  displayFieldWidth={2}
                  required
                  onChange={(_, newValue) => {
                    formik.setFieldValue('employeeRef', newValue?.reference || '')
                    formik.setFieldValue('employeeName', newValue?.fullName || '')
                    formik.setFieldValue('employeeId', newValue?.recordId || null)
                  }}
                  error={formik.touched.employeeId && Boolean(formik.errors.employeeId)}
                />
              </Grid>

              <Grid item xs={2}>
                <CustomDatePicker
                  name='fromDate'
                  label={labels.fromDate}
                  value={formik.values.fromDate}
                  max={formik.values.toDate}
                  required
                  maxAccess={access}
                  onChange={formik.setFieldValue}
                  onClear={() => formik.setFieldValue('fromDate', null)}
                  error={formik.touched.fromDate && Boolean(formik.errors.fromDate)}
                />
              </Grid>

              <Grid item xs={2}>
                <CustomDatePicker
                  name='toDate'
                  label={labels.toDate}
                  value={formik.values.toDate}
                  required
                  min={formik.values.fromDate}
                  maxAccess={access}
                  onChange={formik.setFieldValue}
                  onClear={() => formik.setFieldValue('toDate', null)}
                  error={formik.touched.toDate && Boolean(formik.errors.toDate)}
                />
              </Grid>
              <Grid item xs={0.5}>
                <CustomButton
                  onClick={formik.handleSubmit}
                  label={platformLabels.Preview}
                  image='preview.png'
                  color='primary'
                />
              </Grid>

              <Grid item xs={2.3}></Grid>
              <Grid item xs={0.5}>
                <CustomButton
                  onClick={() => onImportExport(ImportExportMode.IMPORT)}
                  label={platformLabels.import}
                  color='primary'
                  disabled={!formik.values.employeeId}
                />
              </Grid>
              <Grid item xs={0.5}>
                <CustomButton
                  onClick={() => onImportExport(ImportExportMode.EXPORT)}
                  label={platformLabels.Export}
                  color='primary'
                  disabled={!formik.values.employeeId}
                />
              </Grid>
              <Grid item xs={0.5}>
                <CustomButton
                  onClick={onDelete}
                  label={platformLabels.Delete}
                  color='primary'
                  disabled={!formik.values.employeeId || !formik.values.fromDate || !formik.values.toDate}
                />
              </Grid>
              <Grid item xs={0.5}>
                <CustomButton
                  onClick={onGenerate}
                  label={platformLabels.Generate}
                  color='primary'
                  disabled={!formik.values.employeeId}
                />
              </Grid>
            </Grid>

            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView='dayGridMonth'
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              allDaySlot={false}
              height='auto'
              events={events}
              locale={user?.languageId === 2 ? arLocale : enLocale}
              direction={user?.languageId === 2 ? 'rtl' : 'ltr'}
              timeZone='UTC'
              eventDisplay='block'
              firstDay={1}
              eventContent={arg => (
                <div
                  style={{
                    backgroundColor: arg.event.backgroundColor,
                    color: arg.event.textColor,
                    padding: '4px',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    whiteSpace: 'normal',
                    overflow: 'hidden'
                  }}
                >
                  {arg.event.title}
                </div>
              )}
            />
          </Grow>
        </VertLayout>
      </Form>
    </>
  )
}
