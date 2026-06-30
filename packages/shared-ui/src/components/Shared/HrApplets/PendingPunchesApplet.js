import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { TimeAttendanceRepository } from '@argus/repositories/src/repositories/TimeAttendanceRepository'
import CustomDatePicker from '../../Inputs/CustomDatePicker'
import CustomTabPanel from '../CustomTabPanel'
import { Box } from '@mui/material'

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

    const response = await getRequest({
      extension: TimeAttendanceRepository.PendingPunches.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${ ''}`
    })

    return { ...response, _startAt: _startAt }
  }

  const columns = [
    {
      field: 'employeeRef',
      headerName: labels.employeeRef,
      flex: 1
    },
    {
      field: 'employeeName',
      headerName: labels.employeeName,
      flex: 1
    },
    {
      field: 'clockStamp',
      headerName: labels.date,
      flex: 1,
      type: 'dateTime'
    },
    {
      field: 'udId',
      headerName: labels.device,
      flex: 1
    },
    {
      field: 'ppTypeName',
      headerName: labels.type,
      flex: 1
    }
  ]

  return (
    <div className='topRow'>
      <div className='chartCard'>
        <div className='summaryCard'>
          <h2 className='title'>{labels.headCount}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingRight: 8 }}>
            <CustomDatePicker
              name='startDate'
              label={labels.startDate}
              value={''}
              onChange={(_, val) => {}}
              onClear={() => {}}
            />
             <CustomDatePicker
              name='endDate'
              label={labels.endDate}
              value={''}
              onChange={(_, val) => {}}
              onClear={() => {}}
            />
          </div>
        </div>
        <Box sx={{ display: 'flex', height: '350px' }}>
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
