import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { HRDashboardRepository } from '@argus/repositories/src/repositories/HRDashboardRepository'

const LeavingSoon = ({ value, window }) => {
  const { getRequest } = useContext(RequestsContext)
  const isVacation = value?.alertId == 10
  const endpoint = isVacation ?  HRDashboardRepository.LeavingSoon.qry :  HRDashboardRepository.ReturnFromLeave.qry
  
  const {
    query: { data },
    labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: endpoint,
    datasetId: ResourceIds.LeaveRequestODOM
  })

  useSetWindow({ title: isVacation ? labels.vacation : labels.leaveReturn , window })

  const columns = [
    {
      field: 'employeeRef',
      headerName: labels.employeeRef,
      flex: 1
    },
    {
      field: 'employeeName',
      headerName: labels.employee,
      flex: 1,
    },
    {
      field: 'ltName',
      headerName: labels.leaveType,
      flex: 1
    },
    {
      field: 'departmentName',
      headerName: labels.department,
      flex: 1
    },
    {
      field: 'branchName',
      headerName: labels.branch,
      flex: 1
    },
     {
      field: 'leaveRef',
      headerName: labels.leaveRef,
      flex: 1
    },
    {
      field: 'startDate',
      headerName: labels.startDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'endDate',
      headerName: labels.endDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'remainingDays',
      headerName: labels.remainingDays,
      flex: 1,
    }
  ]

  async function fetchGridData() {
    const res = await getRequest({
        extension: endpoint,
        parameters: `_params=`
    })

    const list = (res?.list || []).map( item => {
        return {
            ...item,
            remainingDays: isVacation 
                ? item.remainingDays 
                : Math.floor((new Date() - new Date(Number(item.endDate.match(/\d+/)[0]))) / (1000 * 60 * 60 * 24)),
            startDate: isVacation ? item?.from : item.startDate,
            endDate: isVacation ? item.to : item.endDate
        }
    })

    return {...res, list}
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          name='leavingSoon'
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

LeavingSoon.width = 1100
LeavingSoon.height = 500

export default LeavingSoon
