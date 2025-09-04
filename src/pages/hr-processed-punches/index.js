import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { TimeAttendanceRepository } from 'src/repositories/TimeAttendanceRepository'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import GridToolbar from 'src/components/Shared/GridToolbar'

const ProcessedPunches = () => {
  const { getRequest } = useContext(RequestsContext)
  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: TimeAttendanceRepository.ProcessedPunches.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=1|9`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: labels,
    paginationParameters,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: TimeAttendanceRepository.ProcessedPunches.qry,
    datasetId: ResourceIds.ProcessedPunches
  })

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
      type: 'date'
    },
    {
      field: 'udid',
      headerName: labels.device,
      flex: 1
    },
    {
      field: 'ppTypeName',
      headerName: labels.type,
      flex: 1
    }
  ]

  const actions = [
    {
      key: 'Reset',
      condition: true,
      disabled: false,
      onClick: async () => {
        await getRequest({
          extension: TimeAttendanceRepository.PSP.retry
        })
      }
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar actions={actions} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default ProcessedPunches
