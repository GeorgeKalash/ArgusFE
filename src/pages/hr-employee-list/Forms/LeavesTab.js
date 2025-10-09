import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { Typography } from '@mui/material'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { LoanManagementRepository } from 'src/repositories/LoanManagementRepository'
import { formatDateForGetApI, formatDateFromApi } from 'src/lib/date-helper'

const LeavesTab = ({ labels, maxAccess, store }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { recordId } = store

  console.log(recordId)

  async function fetchGridData() {
    console.log('hoj')

    const response = await getRequest({
      extension: LoanManagementRepository.Leaves.qry,
      parameters: `_filter=&_size=30&_startAt=0&_lsId=0&_employeeId=${recordId}&_asOfDate=${
        store?.date ? formatDateForGetApI(store?.date) : formatDateForGetApI(new Date())
      }`
    })

    if (response && response?.list) {
      response.list = response?.list?.map(item => ({
        ...item,
        name: item?.schedule.name,
        type: item?.summary.leaveType,
        earned: item?.summary.earned,
        used: item?.summary.used,
        lost: item?.summary.lost,
        adjustments: item?.summary.adjustments,
        balance: item?.summary.balance,
        payments: item?.summary.payments
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
    datasetId: ResourceIds.EmployeeFilter
  })

  const columns = [
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'type',
      headerName: labels.type,
      flex: 1
    },
    {
      field: 'earned',
      headerName: labels.earned,
      flex: 1
    },
    {
      field: 'used',
      headerName: labels.used,
      flex: 1
    },
    {
      field: 'lost',
      headerName: labels.lost,
      flex: 1
    },
    {
      field: 'adjustments',
      headerName: labels.adjustment,
      flex: 1
    },
    {
      field: 'payments',
      headerName: labels.payment,
      flex: 1
    },
    {
      field: 'balance',
      headerName: labels.balance,
      flex: 1
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
          pageSize={50}
          pagination={false}
          refetch={refetch}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}

export default LeavesTab
