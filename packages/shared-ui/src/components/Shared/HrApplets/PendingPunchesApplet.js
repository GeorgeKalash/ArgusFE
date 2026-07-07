import { useContext, useEffect } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'
import CustomDatePicker from '../../Inputs/CustomDatePicker'
import { Box } from '@mui/material'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import ResourceComboBox from '../ResourceComboBox'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'
import { formatDateToYYYYMMDD, formatDateFromISO } from '@argus/shared-domain/src/lib/date-helper'
import { Grid } from '@mui/material'

const PendingPunchesApplet = ({ }) => {
  const { getRequest } = useContext(RequestsContext)

  const {
    query: { data },
    labels,
    paginationParameters,
    access,
    refetch
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: TimeAttendanceRepository.PendingPunches.page,
    datasetId: ResourceIds.PendingPunches
  })

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options
    const paramsList = [`1|${formik.values?.ppType || 0}`, `2|${formik.values?.udRef || 0}`]

    if (formik.values?.startDate) paramsList.push(`3|${formatDateToYYYYMMDD(formik.values?.startDate)}`)
    if (formik.values?.endDate) paramsList.push(`4|${formatDateToYYYYMMDD(formik.values?.endDate)}`)

    const response = await getRequest({
      extension: TimeAttendanceRepository.PendingPunches.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${paramsList.join('^')}`
    })

    const list = (response?.list || []).map(item => ({
      ...item,
      clockStamp: item?.clockStamp
        ? formatDateFromISO(item.clockStamp)
        : null
    }))

    return {
      ...response,
      list,
      _startAt
    }
  }

  const { formik } = useForm({
    maxAccess: access,
    initialValues: {
      ppType: null,
      udid: null,
      startDate: null,
      endDate: null
    }
  })

  const columns = [
    {
      field: 'employeeRef',
      headerName: labels.employeeRef,
      flex: 1
    },
    {
      field: 'employeeName',
      headerName: labels.employee,
      flex: 1
    },
    {
      field: 'clockStamp',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'udid',
      headerName: labels.deviceRef,
      flex: 1
    },
    {
      field: 'ppTypeName',
      headerName: labels.type,
      flex: 1
    }
  ]

  useEffect(() => { refetch() }, [formik.values.udid, formik.values.ppType, formik.values.startDate, formik.values.endDate])

 return (
  <div className='topRow'>
    <div className='chartCard'>
      <div className='summaryCard'>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
          <h2
            className='title'
            style={{ alignSelf: 'flex-start', margin: 0 }}>
              {`${labels.punches} ${data?.list?.length || ''}`}
          </h2>
          <Grid container spacing={2}>
            <Grid item xs={3}>
              <ResourceComboBox
                datasetId={DataSets.PENDING_PUNCH_TYPE}
                label={labels.type}
                name='ppType'
                values={formik.values}
                valueField='key'
                displayField='value'
                maxAccess={access}
                onChange={(_, newValue) =>
                  formik.setFieldValue('ppType', newValue?.key || null)
                }
                error={formik.touched.ppType && Boolean(formik.errors.ppType)}
                style={{ minWidth: 200, flex: '1 1 200px' }}
              />
            </Grid>
            <Grid item xs={3}>
              <ResourceComboBox
                endpointId={TimeAttendanceRepository.BiometricDevices.qry}
                name='udid'
                label={labels.biometricDevice}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                maxAccess={access}
                displayFieldWidth={1.5}
                values={formik.values}
                onChange={(_, newValue) => {
                  formik.setFieldValue('udid', newValue?.recordId || null)
                  formik.setFieldValue('udRef', newValue?.reference || '')
                }}
                error={formik.touched.udid && Boolean(formik.errors.udid)}
                style={{ minWidth: 200, flex: '1 1 200px' }}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomDatePicker
                name='startDate'
                label={labels.startDate}
                value={formik.values?.startDate}
                onChange={formik.setFieldValue}
                maxAccess={access}
                onClear={() => formik.setFieldValue('startDate', null)}
                error={formik.touched.startDate && Boolean(formik.errors.startDate)}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomDatePicker
                name='endDate'
                label={labels.endDate}
                value={formik.values?.endDate}
                onChange={formik.setFieldValue}
                maxAccess={access}
                onClear={() => formik.setFieldValue('endDate', null)}
                error={formik.touched.endDate && Boolean(formik.errors.endDate)}
              />
            </Grid>
          </Grid>
        </div>
      </div>

      <Box sx={{ display: 'flex', height: '350px', marginTop: 2 }}>
        <Table
          name='PendingPunches'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          paginationParameters={paginationParameters}
          paginationType='api'
          refetch={refetch}
          pageSize={50}
          maxAccess={access}
        />
      </Box>
    </div>
  </div>
)
}
export default PendingPunchesApplet
