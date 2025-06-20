import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import { ProductModelingRepository } from 'src/repositories/ProductModelingRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import { useDocumentTypeProxy } from 'src/hooks/documentReferenceBehaviors'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import CastingForm from './Forms/CastingForm'

const Casting = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: ProductModelingRepository.Casting.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    access,
    invalidate,
    filterBy
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ProductModelingRepository.Casting.page,
    datasetId: ResourceIds.Casting,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters, pagination }) {
    if (filters.qry)
      return await getRequest({
        extension: ProductModelingRepository.Casting.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
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
      field: 'threeDPRef',
      headerName: labels.threeDP,
      flex: 1
    },
    {
      field: 'setPcs',
      headerName: labels.pieces,
      flex: 1
    },
    {
      field: 'weight',
      headerName: labels.weight,
      flex: 1
    },
    {
      field: 'laborName',
      headerName: labels.labor,
      flex: 1
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

  const { proxyAction } = useDocumentTypeProxy({
    functionId: SystemFunction.Casting,
    action: openForm
  })

  const add = async () => {
    await proxyAction()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: CastingForm,
      props: {
        recordId,
        labels,
        maxAccess: access
      },
      width: 700,
      height: 630,
      title: labels.Casting
    })
  }

  const del = async obj => {
    await postRequest({
      extension: ProductModelingRepository.Casting.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar labels={labels} maxAccess={access} filterBy={filterBy} onAdd={add} reportName={'PMCAS'} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
          pageSize={50}
          paginationType='api'
          deleteConfirmationType={'strict'}
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default Casting
