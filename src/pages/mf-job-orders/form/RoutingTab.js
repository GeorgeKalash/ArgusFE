import { useContext } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from 'src/components/Shared/Table'
import toast from 'react-hot-toast'
import { useWindow } from 'src/windows'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import RoutingForm from './RoutingForm'

export default function RoutingTab({ labels, maxAccess, recordId }) {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    enabled: Boolean(recordId),
    endpointId: ManufacturingRepository.JobRouting.qry,
    datasetId: ResourceIds.MFJobOrders
  })

  const columns = [
    {
      field: 'seqNo',
      headerName: labels.seqNo,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.seqName,
      flex: 1
    },
    {
      field: 'workCenterRef',
      headerName: labels.wcRef,
      flex: 1
    },
    {
      field: 'workCenterName',
      headerName: labels.wcName,
      flex: 1
    },
    {
      field: 'operationName',
      headerName: labels.operation,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    },
    {
      field: 'qtyIn',
      headerName: labels.qtyIn,
      flex: 1,
      type: 'number'
    },
    {
      field: 'pcsIn',
      headerName: labels.pcsIn,
      flex: 1,
      type: 'number'
    },
    {
      field: 'qty',
      headerName: labels.qty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'pcs',
      headerName: labels.pcs,
      flex: 1,
      type: 'number'
    }
  ]

  async function fetchGridData() {
    return await getRequest({
      extension: ManufacturingRepository.JobRouting.qry,
      parameters: `_jobId=${recordId}&_workcenterId=0&_status=0`
    })
  }

  const add = async () => {
    openForm()
  }

  const editJRO = obj => {
    openForm(obj)
  }

  async function openForm(obj) {
    stack({
      Component: RoutingForm,
      props: {
        labels,
        maxAccess,
        obj
      },
      width: 700,
      height: 470,
      title: labels.routing
    })
  }

  const delJRO = async obj => {
    await postRequest({
      extension: ManufacturingRepository.JobRouting.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          name='routingTable'
          columns={columns}
          gridData={data}
          rowId={['seqNo', 'seqName', 'workCenterId', 'operationId']}
          onEdit={editJRO}
          onDelete={delJRO}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}
