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
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useDocumentTypeProxy } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'
import { ManufacturingRepository } from '@argus/repositories/src/repositories/ManufacturingRepository'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import StandardCostForm from './Forms/StandardCostForm'

const StandardCost = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: ManufacturingRepository.StandardCost.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params}`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry) {
      return await getRequest({
        extension:  ManufacturingRepository.StandardCost.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

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
    endpointId: ManufacturingRepository.StandardCost.page,
    datasetId: ResourceIds.StandardCost,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.StandardCost,
    action: openForm
  })

  const add = async () => {
    await proxyAction()
  }

  const columns = [
    {
      field: 'dtName',
      headerName: labels.docType,
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
      field: 'itemGroupRef',
      headerName: labels.itemGroup,
      flex: 1
    },
    {
      field: 'itemCategoryRef',
      headerName: labels.itemCategory,
      flex: 1
    },
    {
      field: 'collectionName',
      headerName: labels.collection,
      flex: 1
    },
    {
      field: 'productionLineRef',
      headerName: labels.productionLine,
      flex: 1
    },
    {
      field: 'amount',
      headerName: labels.amount,
      flex: 1,
      type: 'number'
    },
    {
      field: 'notes',
      headerName: labels.notes,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.statusName,
      flex: 1
    },
    {
      field: 'wipName',
      headerName: labels.wip,
      flex: 1
    }
  ]

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: StandardCostForm,
      props: {
        labels,
        recordId,
        access
      },
      width: 1000,
      height: 700,
      title: labels.StandardCostUpdate
    })
  }

  const del = async obj => {
    await postRequest({
      extension: ManufacturingRepository.StandardCost.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} filterBy={filterBy} reportName={'MFSCU'} />
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

export default StandardCost
