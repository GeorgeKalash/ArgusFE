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
import { FoundryRepository } from '@argus/repositories/src/repositories/FoundryRepository'
import FOCuttingWindow from './Windows/CuttingWindow'

const FoCuttings = () => {
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
    endpointId: FoundryRepository.Cutting.page,
    datasetId: ResourceIds.FoCuttings,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'dtName',
      headerName: labels.documentType,
      flex: 1
    },
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
      field: 'castingRef',
      headerName: labels.casting,
      flex: 1
    },
    {
      field: 'laborName',
      headerName: labels.labor,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      type: 'badge',
      family: 'document',
      valueField: 'status',
      flex: 1
    }
  ]

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: FoundryRepository.Cutting.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params}`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: FoundryRepository.Cutting.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.Cutting,
    action: openForm
  })

  const add = () => {
    proxyAction()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  async function openForm(recordId) {
    stack({
      Component: FOCuttingWindow,
      props: {
        labels,
        access,
        recordId
      },
      width: 1000,
      height: 550,
      title: labels.cutting
    })
  }

  const del = async obj => {
    await postRequest({
      extension: FoundryRepository.Cutting.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} filterBy={filterBy} reportName={'FOCUT'} />
      </Fixed>
      <Grow>
        <Table
          name='table'
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

export default FoCuttings