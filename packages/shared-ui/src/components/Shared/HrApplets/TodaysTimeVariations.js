import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { HRDashboardRepository } from '@argus/repositories/src/repositories/HRDashboardRepository'

const TodaysTimeVariations = ({ index, window }) => {
  const { getRequest } = useContext(RequestsContext)
  const TimeCodes = {
    EARLY_CHECKIN: 51,
    LATE_CHECKIN: 31,
    DURING_SHIFT_LEAVE: 32,
    EARLY_LEAVE: 33,
    OVERTIME: 52
  }

  const TIME_CODE_LIST = [TimeCodes.EARLY_CHECKIN, TimeCodes.LATE_CHECKIN, TimeCodes.DURING_SHIFT_LEAVE, TimeCodes.EARLY_LEAVE, TimeCodes.OVERTIME ]
  const fetchGridData = async () => {
    return await getRequest({
      extension: HRDashboardRepository.TimeVariations.qry,
      parameters: `_timeCode=${TIME_CODE_LIST[index]}&_params=`
    })
  }

  const {
    query: { data },
    labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: HRDashboardRepository.TimeVariations.qry,
    datasetId: ResourceIds.TodaysTimeVariationsSummary
  })

  const getTitle = [labels.earlyCheckIn, labels.lateCheckIn, labels.duringShiftLeave, labels.earlyLeave, labels.overtime]
  useSetWindow({ title: `${labels.todaysTimeVariations || ''} - ${getTitle?.[index] || ''}`, window })

  const columns = [
    {
      field: 'employeeName',
      headerName: labels.employee,
      flex: 1
    },
    {
      field: 'positionName',
      headerName: labels.position,
      flex: 1
    },
    {
      field: 'branchName',
      headerName: labels.branch,
      flex: 1
    },
    {
      field: 'clockDuration',
      headerName: labels.clockDuration,
      flex: 1
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <Table
          name='todaysTimeVariations'
          maxAccess={access}
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

TodaysTimeVariations.width = 1000
TodaysTimeVariations.height = 500

export default TodaysTimeVariations