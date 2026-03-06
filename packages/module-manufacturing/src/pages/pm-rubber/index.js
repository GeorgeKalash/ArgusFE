import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { ProductModelingRepository } from '@argus/repositories/src/repositories/ProductModelingRepository'
import RubberForm from './Forms/RubberForm'
import { useDocumentTypeProxy } from '@argus/shared-hooks/src/hooks/documentReferenceBehaviors'
import { SystemFunction } from '@argus/shared-domain/src/resources/SystemFunction'

const Rubber = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

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
    endpointId: ProductModelingRepository.Rubber.page,
    datasetId: ResourceIds.Rubber,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: ProductModelingRepository.Rubber.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: ProductModelingRepository.Rubber.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

  const columns = [
    {
      field: 'dtRef',
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
      field: 'startDate',
      headerName: labels.startDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'endDate',
      headerName: labels.endDate,
      flex: 1,
      type: 'date'
    },
    {
      field: 'modelRef',
      headerName: labels.model,
      flex: 1,
      valueLink: {
        resourceId: ResourceIds.ThreeDPrint,
        props: row => ({
          recordId: row.modelId,
        })
      }
    },
    {
      field: 'laborName',
      headerName: labels.labor,
      flex: 1
    },
    {
      field: 'pcs',
      headerName: labels.rubberpcs,
      flex: 1,
      type: 'number'
    },
    {
      field: 'productionLineName',
      headerName: labels.productionLine,
      flex: 1
    },
    {
      field: 'statusName',
      headerName: labels.status,
      flex: 1
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: ProductModelingRepository.Rubber.del,
      record: JSON.stringify(obj)
    })

    toast.success(platformLabels.Deleted)
    invalidate()
  }

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.Rubber,
    action: openForm
  })

  const add = async () => {
    await proxyAction()
  }

  function openForm(recordId) {
    stack({
      Component: RubberForm,
      props: {
        labels,
        recordId,
        access
      },
      width: 550,
      height: 690,
      title: labels?.rubber
    })
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={access} filterBy={filterBy} reportName={'PMRBR'} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          paginationParameters={paginationParameters}
          deleteConfirmationType={'strict'}
          paginationType='api'
          refetch={refetch}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default Rubber
