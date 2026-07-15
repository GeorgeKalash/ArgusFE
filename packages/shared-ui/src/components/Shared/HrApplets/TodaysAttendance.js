import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { HRDashboardRepository } from '@argus/repositories/src/repositories/HRDashboardRepository'
import { formatDate } from '@argus/shared-domain/src/lib/date-helper'

const TodaysAttendance = ({ index, window }) => {
  const { getRequest } = useContext(RequestsContext)
  const config = {
    0: {
      endpoint: HRDashboardRepository.Dashboard.dashBoardPE,
      fields: { from: 'dtFrom', to: 'dtTo' },
      showDates: true
    },
    1: {
      endpoint: HRDashboardRepository.Dashboard.dashBoardNS,
      fields: { from: 'dayStart', to: 'dayEnd' },
      showDates: true,
      transform: item => ({
        ...item,
        dayStart: formatDate(item.dayStart),
        dayEnd: formatDate(item.dayEnd)
      })
    },
    2: {
      endpoint: HRDashboardRepository.Dashboard.dashBoardCH,
      showFirstPunch: true,
      showDates: false
    },
    3: {
      endpoint: HRDashboardRepository.Dashboard.dashBoardLE,
      fields: { from: 'startDate', to: 'endDate' },
      showDates: true
    },
    4: {
      endpoint: HRDashboardRepository.Dashboard.dashBoardDO,
      showDates: false
    }
  } 

  const current = config[index]

  const fetchGridData = async () => {
    const res = await getRequest({
      extension: current.endpoint,
      parameters: `_params=`
    })

    const list = (res?.list || []).map(item => {
      if (index === 1 && current.transform) return current.transform(item)

      return item
    })

    return { ...res, list }
  }

  const {
    query: { data },
    labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: current.endpoint,
    datasetId: ResourceIds.TodaysAttendance
  })

  const getTitle = [labels.pending, labels.noShowUp, labels.checked, labels.leave, labels.dayOff]
  useSetWindow({ title: Object.keys(labels).length ? `${labels.todaysAttendance || ''} - ${getTitle?.[index] || ''}` : ``, window })

  const columns = [
    {
      field: 'employeeName',
      headerName: labels.employee,
      flex: 1
    },
    index === 2 && {
      field: 'firstPunch',
      headerName: labels.firstPunch,
      flex: 1
    },
    {
      field: 'positionName',
      headerName: labels.position,
      flex: 1
    },
    current?.showDates && {
      field: current?.fields?.from,
      headerName: labels.from,
      flex: 1,
      type: 'date' 
    },
    current?.showDates && {
      field: current?.fields?.to,
      headerName: labels.to,
      flex: 1,
      type: 'date' 
    },
    {
      field: 'branchName',
      headerName: labels.branch,
      flex: 1
    }
  ].filter(Boolean)

  return (
    <VertLayout>
      <Grow>
        <Table
          name='todaysAttendance'
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

TodaysAttendance.width = 1000
TodaysAttendance.height = 500

export default TodaysAttendance