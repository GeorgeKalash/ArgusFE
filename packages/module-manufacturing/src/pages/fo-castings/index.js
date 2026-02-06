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
import { useDocumentTypeProxy } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import FOCastingWindow from './window/FOCastingWindow'
import { FoundryRepository } from '@argus/repositories/src/repositories/FoundryRepository'

const FoCastings = () => {
  const { postRequest, getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  const {
    query: { data },
    filterBy,
    refetch,
    labels,
    access,
    paginationParameters,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: FoundryRepository.Casting.page,
    datasetId: ResourceIds.FoCastings,
    filter: {
      filterFn: fetchWithFilter
    }
  })

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
      field: 'waxRef',
      headerName: labels.waxRef,
      flex: 1
    },
    {
      field: 'mouldRef',
      headerName: labels.mould,
      flex: 1
    },
    {
      field: 'metalRef',
      headerName: labels.metal,
      flex: 1
    },
    {
      field: 'metalColorRef',
      headerName: labels.metalColor,
      flex: 1
    },
    {
      field: 'grossWgt',
      headerName: labels.grossWgt,
      flex: 1,
      type: 'number'
    },
    {
      field: 'rmWgt',
      headerName: labels.rmWgt,
      flex: 1,
      type: 'number'
    },
    {
      field: 'mouldWgt',
      headerName: labels.mouldWgt,
      flex: 1,
      type: 'number'
    },
    {
      field: 'netWgt',
      headerName: labels.netWgt,
      flex: 1,
      type: 'number'
    },
    {
      field: 'suggestedWgt',
      headerName: labels.suggestedWgt,
      flex: 1,
      type: 'number'
    },
    {
      field: 'inputWgt',
      headerName: labels.inputWgt,
      flex: 1,
      type: 'number'
    },
    {
      field: 'netInputWgt',
      headerName: labels.netInputWgt,
      flex: 1,
      type: 'number'
    },
    {
      field: 'outputWgt',
      headerName: labels.outputWgt,
      flex: 1,
      type: 'number'
    },
    {
      field: 'loss',
      headerName: labels.loss,
      flex: 1,
      type: 'number'
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    }
  ]

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: FoundryRepository.Casting.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: FoundryRepository.Casting.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.Casting,
    action: openForm
  })

  const add = () => {
    proxyAction()
  }

  const editCAS = obj => {
    openForm(obj?.recordId)
  }

  async function openForm(recordId) {
    stack({
      Component: FOCastingWindow,
      props: {
        labels,
        access,
        recordId
      },
      width: 1150,
      height: 750,
      title: labels.castings
    })
  }

  const delCAS = async obj => {
    await postRequest({
      extension: FoundryRepository.Casting.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} filterBy={filterBy} reportName={'FOCAS'} />
      </Fixed>
      <Grow>
        <Table
          name='casting'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={editCAS}
          refetch={refetch}
          onDelete={delCAS}
          deleteConfirmationType={'strict'}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          paginationParameters={paginationParameters}
          paginationType='api'
        />
      </Grow>
    </VertLayout>
  )
}

export default FoCastings
