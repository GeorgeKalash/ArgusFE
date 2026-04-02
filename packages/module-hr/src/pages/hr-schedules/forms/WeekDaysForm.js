import { getBottomNavigationActionUtilityClass, Grid } from '@mui/material'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useContext, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'
import CustomTimePicker from '@argus/shared-ui/src/components/Inputs/CustomTimePicker'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'
import dayjs from 'dayjs'
import { formatTimeToApi } from '@argus/shared-domain/src/lib/date-helper'

export default function WeekDaysForm ({ labels, maxAccess, scheduleId, dayId, invalidate }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const conditions = {
    name: row => row?.name,
    start: row => row?.start,
    end: row => row?.end
  }
  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')

  const { formik } = useForm({
    maxAccess,
    conditionSchema: ['items'],
    initialValues: {
      scId: scheduleId,
      dow: dayId,
      dayTypeId: null,
      firstIn: null,
      lastOut: null,
      items:[{
        scId: scheduleId,
        dow: dayId,
        seqNo: 0,
        name: '',
        start: null,
        end: null
      }]
    },
    validationSchema: yup.object({
      dayTypeId: yup.string().required(),
      firstIn: yup.string().required(),
      lastOut: yup.string().required(),
      items: yup.array().of(schema)
    }),
    onSubmit: async values => {
        const modifiedItems = values?.items
        .map((item, index) => {
            return {
            ...item,
            seqNo: index + 1,
            scId: scheduleId,
            dow: dayId,
            break: item?.break ? formatTimeToApi(item.break) : null,
            start: item?.start ? formatTimeToApi(item.start) : null,
            end: item?.end ? formatTimeToApi(item?.end) : null
            }
        })
        .filter(row => Object.values(requiredFields)?.every(fn => fn(row)))

        await postRequest({
          extension: TimeAttendanceRepository.AttendanceBreakPack.set2,
          record: JSON.stringify({ scId: scheduleId, dow: dayId, items: modifiedItems })
        })
        toast.success(platformLabels.Updated)
        invalidate()
    }
  })

  async function fetchForm() {
    if(!dayId || !scheduleId) return
    const res = await getRequest({
      extension: TimeAttendanceRepository.ScheduleDay.get,
      parameters: `_scId=${scheduleId}&_dow=${dayId}`
    })

    const periods = await getRequest({
      extension: TimeAttendanceRepository.AttendanceBreakPack.qry,
      parameters: `_scId=${scheduleId}&_dow=${dayId}`
    })

    formik.setValues({...res?.record,
      firstIn: res?.record?.firstIn ? dayjs(res.record.firstIn, 'HH:mm') : null,
      lastOut: res?.record?.lastOut ? dayjs(res.record.lastOut, 'HH:mm') : null,
      items: (periods?.list || []).map((item, index) => {
        return {
           ...item,
           id: index++
          }
        }
      )
    })
  }
  
  const columns = [
    {
      component: 'timepicker',
      label: labels.break,
      name: 'name',
      props:{ use24Hour: true }
    },
    {
      component: 'timepicker',
      label: labels.fromTime,
      name: 'start',
      props:{ use24Hour: true }
    },
    {
      component: 'timepicker',
      label: labels.toTime,
      name: 'end',
      props:{ use24Hour: true }
    }
  ]
   
  useEffect(() => {
    fetchForm()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.AttendanceSchedule}
      form={formik}
      maxAccess={maxAccess}
      isInfo={false}
      isCleared={false}
      editMode={true}
    >
      <VertLayout>
        <Fixed>
          <Grid container gap={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={TimeAttendanceRepository.DayTypes.qry}
                name='dayTypeId'
                label={labels.dayType}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                required
                onChange={(_, newValue) => {
                  formik.setFieldValue('dayTypeId', newValue?.recordId || '')
                  formik.setFieldValue('isWorkingDay', newValue?.isWorkingDay || false)
                }}
                error={formik.touched.dayTypeId && Boolean(formik.errors.dayTypeId)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTimePicker
                label={labels.firstIn}
                name='firstIn'
                required
                value={formik.values.firstIn}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('firstIn', '')}
                use24Hour
                maxAccess={maxAccess}
                error={formik.touched.firstIn && Boolean(formik.errors.firstIn)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTimePicker
                label={labels.lastOut}
                name='lastOut'
                required
                value={formik.values.lastOut}
                onChange={formik.setFieldValue}
                onClear={() => formik.setFieldValue('lastOut', '')}
                use24Hour
                maxAccess={maxAccess}
                error={formik.touched.lastOut && Boolean(formik.errors.lastOut)}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
         <DataGrid
            name='breakPeriods'  
            initialValues={formik.initialValues.items[0]}
            onChange={value => formik.setFieldValue('items', value)}
            columns={columns}
            value={formik.values.items}
            error={formik.errors.items}
            maxAccess={maxAccess}
         />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

