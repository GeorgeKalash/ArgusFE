import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { Typography } from '@mui/material'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { LoanManagementRepository } from '@argus/repositories/src/repositories/LoanManagementRepository'
import { formatDateTimeForGetAPI } from '@argus/shared-domain/src/lib/date-helper'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'

const LeavesTab = ({ labels, maxAccess, store }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { recordId } = store

  async function fetchGridData() {
    const response = await getRequest({
      extension: LoanManagementRepository.Leaves.qry,
      parameters: `_filter=&_size=30&_startAt=0&_lsId=0&_employeeId=${recordId}&_asOfDate=${
        store?.date ? formatDateTimeForGetAPI(store?.date) : formatDateTimeForGetAPI(new Date())
      }`
    })

    if (response && response?.list) {
      response.list = response?.list?.map(item => ({
        ...item,
        earned: item?.summary.earned,
        used: item?.summary.used,
        lost: item?.summary.carryOverDeducted,
        adjustments: item?.summary.adjustments,
        balance: item?.summary.balance,
        payments: item?.summary.payments,
        checked: item?.isEnrolled
      }))
    }

    return response
  }

  const {
    query: { data },
    refetch
  } = useResourceQuery({
    enabled: !!recordId,
    queryFn: fetchGridData,
    endpointId: LoanManagementRepository.Leaves.qry,
    datasetId: ResourceIds.EmployeeFilter,
    params: { disabledReqParams: true, maxAccess }
  })

  const columns = [
    {
      field: 'schedule.name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'summary.lttName',
      headerName: labels.type,
      flex: 1
    },
    {
      field: 'earned',
      headerName: labels.earned,
      flex: 1,
      type: { field: 'number', decimal: 2 },
    },
    {
      field: 'used',
      headerName: labels.used,
      flex: 1,
      type: { field: 'number', decimal: 2 },
    },
    {
      field: 'lost',
      headerName: labels.lost,
      flex: 1,
      type: { field: 'number', decimal: 2 },
    },
    {
      field: 'adjustments',
      headerName: labels.adjustment,
      flex: 1,
      type: { field: 'number', decimal: 2 },
    },
    {
      field: 'payments',
      headerName: labels.payment,
      flex: 1,
      type: { field: 'number', decimal: 2 },
    },
    {
      field: 'balance',
      headerName: labels.balance,
      flex: 1,
      type: { field: 'number', decimal: 2 },
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <Typography variant='h6' padding={2}>
          {labels.LeaveBalance}
        </Typography>
      </Fixed>
      <Grow>
        <Table
          name='leaveBalanceTable'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          showCheckboxColumn={true}
          handleCheckboxChange={async (data, checked) => {
            if (!checked) {
              await postRequest({
                extension: EmployeeRepository.Leaves.del,
                record: JSON.stringify({
                  employeeId: recordId,
                  ltId: data?.schedule?.ltId,
                  lsId: data?.schedule?.recordId
                })
              })
            } else {
              await postRequest({
                extension: EmployeeRepository.Leaves.set,
                record: JSON.stringify({
                  employeeId: recordId,
                  ltId: data?.schedule?.ltId,
                  lsId: data?.schedule?.recordId
                })
              })
            }

            refetch()
          }}
          pageSize={50}
          pagination={false}
          refetch={refetch}
          maxAccess={maxAccess}
          showSelectAll={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default LeavesTab
