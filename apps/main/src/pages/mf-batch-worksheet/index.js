import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { useDocumentTypeProxy } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import BatchWorksheetWindow from './Windows/BatchWorksheetWindow'

const MfBatchWorksheet = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    labels,
    filterBy,
    paginationParameters,
    invalidate,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.BatchWorksheet.page,
    datasetId: ResourceIds.BatchWorksheet,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: ManufacturingRepository.BatchWorksheet.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: ManufacturingRepository.BatchWorksheet.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params}`
    })

    return { ...response, _startAt: _startAt }
  }

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'workCenterName',
      headerName: labels.workCenterName,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.wip,
      flex: 1,
      type: 'date'
    },
    {
      field: 'wipName',
      headerName: labels.wip,
      flex: 1
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: ManufacturingRepository.BatchWorksheet.del,
      record: JSON.stringify(obj)
    })
    toast.success(platformLabels.Deleted)
    invalidate()
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.BatchWorksheet,
    action: openForm
  })

  const add = async () => {
    await proxyAction()
  }

  function openForm(recordId) {
    stack({
      Component: BatchWorksheetWindow,
      props: {
        labels,
        recordId,
        access
      },
      width: 1000,
      title: labels.batchWorksheet
    })
  }

  const onEdit = obj => {
    openForm(obj?.recordId)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} reportName={'MFBWST'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          paginationParameters={paginationParameters}
          paginationType='api'
          refetch={refetch}
          onEdit={onEdit}
          onDelete={del}
          deleteConfirmationType='strict'
          pageSize={50}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default MfBatchWorksheet
