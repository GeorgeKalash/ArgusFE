import { useContext } from 'react'
import toast from 'react-hot-toast'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import * as yup from 'yup'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'
import { Grid } from '@mui/material'
import { DataGrid } from '@argus/shared-ui/src/components/Shared/DataGrid'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import { formatDateToYYYYMMDD } from '@argus/shared-domain/src/lib/date-helper'
import { createConditionalSchema } from '@argus/shared-domain/src/lib/validation'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { useError } from '@argus/shared-providers/src/providers/error'

export default function Holidays () {
  const { platformLabels } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const { labels, access: maxAccess } = useResourceParams({
    datasetId: ResourceIds.Holidays
  })

  const conditions = {
    caId: row => row?.caId,
    scId: row => row?.scId,
    dayId: row => row?.dayId
  }

  const { schema, requiredFields } = createConditionalSchema(conditions, true, maxAccess, 'items')
  const { formik } = useForm({
    initialValues: {
      fiscalYear: null,
      dayTypeId: null,
      items: []
    },
    maxAccess,
    validationSchema: yup.object({
      fiscalYear: yup.string().required(),
      dayTypeId: yup.string().required(),
      items: yup.array().of(schema)
    }),
    onSubmit: async obj => {
      const seen = new Set()
      const hasDuplicates = (obj?.items || []).some(row => {
        const key = `${row.caId}-${row.dayId}`
        if (seen.has(key)) return true
        seen.add(key)

        return false
      })

      if (hasDuplicates) {
        stackError({ message: labels.duplicateRows })
        
        return
      }

      const payload = {
        year: obj.fiscalYear,
        dayTypeId: obj.dayTypeId,
        items: (obj?.items || []).filter(row => Object.values(requiredFields)?.every(fn => fn(row))).map(item => {
          return { ...item, dayId: formatDateToYYYYMMDD(item.dayId) }
        })
      }

      await postRequest({
        extension: TimeAttendanceRepository.CalendarDay.set2,
        record: JSON.stringify(payload)
      })
      toast.success(platformLabels.Updated)
    }
  })

  const hasFilters = formik.values.fiscalYear && formik.values.dayTypeId

  const columns = [
    {
      component: 'resourcecombobox',
      label: labels.calendar,
      name: 'caId',
      props: {
        endpointId: TimeAttendanceRepository.Calendar.qry,
        displayField: 'name',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'caId' },
          { from: 'reference', to: 'caRef' },
          { from: 'name', to: 'caName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    },
    {
      component: 'resourcecombobox',
      label: labels.schedule,
      name: 'scId',
      props: {
        endpointId: TimeAttendanceRepository.Schedule.qry,
        displayField: 'reference',
        valueField: 'recordId',
        mapping: [
          { from: 'recordId', to: 'scId' },
          { from: 'reference', to: 'scRef' },
          { from: 'name', to: 'scName' }
        ],
        columnsInDropDown: [
          { key: 'reference', value: 'Reference' },
          { key: 'name', value: 'Name' }
        ]
      }
    },
    {
      component: 'date',
      label: labels.day,
      name: 'dayId'
    }
  ]

  const loadHolidays = async () => {
    
    const items = await getRequest({
      extension: TimeAttendanceRepository.CalendarDay.qry3,
      parameters: `_year=${formik.values.fiscalYear}&_dayTypeId=${formik.values.dayTypeId}`
    })

    const CDList = items?.list?.length ? 
      items?.list?.map((item, index) => ({...item, id: index + 1, 
        dayId: item?.dayId 
        ? new Date(item?.dayId.slice(0, 4), item?.dayId.slice(4, 6) - 1, item?.dayId.slice(6, 8)) 
        : null})) 
      : [{id: 1, caId: null, scId: null, dayId: null, dow: 0 }]

    formik.setFieldValue('items', CDList)
  }

  return (
    <FormShell
      resourceId={ResourceIds.Holidays}
      form={formik}
      maxAccess={maxAccess}
      editMode={true}
      isInfo={false}
      isCleared={false}
      disabledSubmit={!hasFilters}
      onClear={() => formik.resetForm()}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <ResourceComboBox
                endpointId={SystemRepository.FiscalYears.qry}
                name='fiscalYear'
                label={labels.fiscalYear}
                valueField='fiscalYear'
                displayField='fiscalYear'
                values={formik.values}
                required
                maxAccess={maxAccess}
                onChange={(_, newValue) => formik.setFieldValue('fiscalYear', newValue?.fiscalYear || null)}
                error={formik.touched.fiscalYear && Boolean(formik.errors.fiscalYear)}
               />
            </Grid>
            <Grid item xs={3}>
              <ResourceComboBox
                endpointId={TimeAttendanceRepository.DayTypes.qry}
                name='dayTypeId'
                label={labels.dayType}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                maxAccess={maxAccess}
                required
                onChange={(_, newValue) => formik.setFieldValue('dayTypeId', newValue?.recordId || null)}
                error={formik.touched.dayTypeId && Boolean(formik.errors.dayTypeId)}
              />
            </Grid>
            <Grid item xs={2}>
              <CustomButton
                onClick={loadHolidays}
                label={platformLabels.Preview}
                image={'preview.png'}
                tooltipText={platformLabels.Preview}
                disabled={!hasFilters}
              />
            </Grid>
          </Grid>
        </Fixed>
        <Grow>
          <DataGrid
            onChange={value => formik.setFieldValue('items', value)}
            value={formik.values.items}
            error={formik.errors.items}
            columns={columns}
            name='items'
            maxAccess={maxAccess}
            disabled={!hasFilters}
            allowAddNewLine={hasFilters}
            allowDelete={hasFilters}
          />
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
