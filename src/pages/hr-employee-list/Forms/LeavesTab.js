import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { RepairAndServiceRepository } from 'src/repositories/RepairAndServiceRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { Grid, Typography } from '@mui/material'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'

const LeavesTab = ({ labels, maxAccess, store }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { recordId } = store

  async function fetchGridData() {
    const response = await getRequest({
      extension: RepairAndServiceRepository.EquipmentType.qry,
      parameters: `_filter=&_size=30_startAt=0&_equipmentId=${recordId}`
    })

    return response
  }

  const {
    query: { data },
    refetch
  } = useResourceQuery({
    enabled: !!recordId,
    queryFn: fetchGridData,
    endpointId: RepairAndServiceRepository.EquipmentType.qry,
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
      field: 'adjustment',
      headerName: labels.adjustment,
      flex: 1
    },
    {
      field: 'payment',
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
        <Typography variant='h6' padding={2}>{labels.LeaveBalance}</Typography>
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
