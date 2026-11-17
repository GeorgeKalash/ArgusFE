import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useDocumentTypeProxy } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { Router } from '@argus/shared-domain/src/lib/useRouter'
import { BrokerageTradingRepository } from '@argus/repositories/src/repositories/BrokerageTradingRepository'
import { useRecordLock } from '@argus/shared-hooks/src/hooks/useRecordLock'
import FixingCancellationForm from '@argus/shared-ui/src/components/Shared/Forms/FixingCancellationForm'

export default function BTFixingCancellation() {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()
  const { checkLock } = useRecordLock()
  const { functionId } = Router()

  const FixingEndpoints = {
    [SystemFunction.FixingSalesCancellation]: {
      page: BrokerageTradingRepository.FixingSalesCancellation.page,
      snapshot: BrokerageTradingRepository.FixingSalesCancellation.snapshot,
      del: BrokerageTradingRepository.FixingSalesCancellation.del
    },
    [SystemFunction.FixingPurchaseCancellation]: {
      page: BrokerageTradingRepository.FixingPurchaseCancellation.page,
      snapshot: BrokerageTradingRepository.FixingPurchaseCancellation.snapshot,
      del: BrokerageTradingRepository.FixingPurchaseCancellation.del
    }
  }
  const getFixingApi = (functionId) => FixingEndpoints[Number(functionId)]

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = []  } = options

    const response = await getRequest({
      extension: getFixingApi(functionId).page,
      parameters: `_startAt=${_startAt}&_params=${params}&_pageSize=${_pageSize}`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithSearch({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: getFixingApi(functionId).snapshot,
        parameters: `_filter=${filters.qry}&_functionId=${functionId}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  const getResourceId = functionId => {
    switch (functionId) {
      case SystemFunction.FixingSalesCancellation:
        return ResourceIds.FixingSalesCancellation
      case SystemFunction.FixingPurchaseCancellation:
        return ResourceIds.FixingPurchaseCancellation
      default:
        return null
    }
  }

  const {
    query: { data },
    refetch,
    labels,
    filterBy,
    paginationParameters,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: getFixingApi(functionId).page,
    datasetId: ResourceIds.FixingSalesCancellation,
    DatasetIdAccess: getResourceId(parseInt(functionId)),
    filter: {
      filterFn: fetchWithSearch,
      default: { functionId }
    }
  })

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'dtName',
      headerName: labels.docType,
      flex: 1
    },
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'fixReference',
      headerName: labels.fixingRef,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      type: 'badge',
      family: 'document',
      valueField: 'status',
      flex: 1
    },
    {
      field: 'notes',
      headerName: labels.notes,
      flex: 1
    }
  ]

  const edit = obj => {
    openForm(obj?.recordId, obj?.status == 3)
  }

  async function openForm(recordId, disabled) {
    const canOpen = await checkLock({
      resourceId: getResourceId(parseInt(functionId)),
      recordId,
      disabled
    })

    if (!canOpen) return

    stack({
      Component: FixingCancellationForm,
      props: {
        recordId,
        functionId,
      }
    })
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId,
    action: openForm
  })

  const add = async () => { await proxyAction() }

  const del = async obj => {
    await postRequest({
      extension: getFixingApi(functionId).del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} reportName={'BTFIXC'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          deleteConfirmationType={'strict'}
          pageSize={50}
          paginationParameters={paginationParameters}
          refetch={refetch}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}
