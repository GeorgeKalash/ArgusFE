import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import toast from 'react-hot-toast'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { EmployeeRepository } from '@argus/repositories/src/repositories/EmployeeRepository'
import ResignationReqForm from '@argus/shared-ui/src/components/Shared/Forms/ResignationReqForm'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { useDocumentTypeProxy } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'

const ResignationRequest = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    refetch,
    labels,
    access,
    paginationParameters,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: EmployeeRepository.ResignationRequest.page,
    datasetId: ResourceIds.ResignationRequest
  })

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'employeeName',
      headerName: labels.employeeName,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'reasonName',
      headerName: labels.reason,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    },
    {
      field: 'rsName',
      headerName: labels.statusRelease,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: labels.wip,
      flex: 1
    }
  ]

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: EmployeeRepository.ResignationRequest.page,
      parameters: `_startAt=${_startAt}&_size=${_pageSize}&_params=${params}&_sortBy=recordId&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.ResignationRequest,
    action: openForm
  })

  const add = async () => {
    await proxyAction()
  }

  const edit = obj => {
    openForm(obj.recordId)
  }

  async function openForm(recordId) {
    stack({
      Component: ResignationReqForm,
      props: {
        recordId,  
      }
    })
  }

  const del = async obj => {
    await postRequest({
      extension: EmployeeRepository.ResignationRequest.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          name='resReqTable'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          refetch={refetch}
          onDelete={del}
          deleteConfirmationType={'strict'}
          pageSize={50}
          maxAccess={access}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default ResignationRequest
