import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useDocumentTypeProxy } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import BatchTransferForm from './Forms/BatchTransferForm'

const BatchTransfer = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: ManufacturingRepository.BatchTransfer.page,
      parameters: `_filter=&_size=30&_startAt=${_startAt}&_sortBy=recordId desc&_pageSize=${_pageSize}&_params=${
        params || ''
      }`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithSearch({ qry }) {
    return await getRequest({
      extension: ManufacturingRepository.BatchTransfer.snapshot,
      parameters: `_filter=${qry}`
    })
  }

  const {
    query: { data },
    labels: labels,
    search,
    clear,
    paginationParameters,
    refetch,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.BatchTransfer.page,
    datasetId: ResourceIds.BatchTransfer,
    search: {
      searchFn: fetchWithSearch
    }
  })

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.BatchTransfer,
    action: openForm
  })

  const add = async () => {
    await proxyAction()
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'fromWCName',
      headerName: labels.fromWC,
      flex: 1
    },
    {
      field: 'toWCName',
      headerName: labels.toWC,
      flex: 1
    },
    {
      field: 'notes',
      headerName: labels.notes,
      flex: 1
    },
    {
      field: 'releaseStatus',
      headerName: labels.releaseStatus,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    }
  ]

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: BatchTransferForm,
      props: {
        labels,
        recordId,
        maxAccess: access
      },
      width: 1000,
      height: 750,
      title: labels.batchTransfer
    })
  }

  const del = async obj => {
    await postRequest({
      extension: ManufacturingRepository.BatchTransfer.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          onSearch={search}
          onSearchClear={clear}
          labels={labels}
          inputSearch={true}
        />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default BatchTransfer