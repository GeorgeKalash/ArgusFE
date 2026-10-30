import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import DimensionalTargetForm from './Forms/DimensionalTargetForm'

export default function DimensionalTarget () {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: SaleRepository.DimensionalTarget.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    })
    return { ...response, _startAt }
  }

  const {
    query: { data },
    labels,
    filterBy,
    paginationParameters,
    refetch,
    access: maxAccess,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SaleRepository.DimensionalTarget.page,
    datasetId: ResourceIds.DimensionalTarget,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({
      _startAt: pagination?._startAt || 0,
      params: filters?.params
    })
  }

  const columns = [
    { field: 'fiscalYear', headerName: labels.fiscalYear, flex: 1 },
    { field: 'periodName', headerName: labels.period, flex: 1 },
    { field: 'metalRef', headerName: labels.metal, flex: 1 },
    { field: 'plantRef', headerName: labels.plant, flex: 1 },
    { field: 'itemGroupRef', headerName: labels.itemGroup, flex: 1 },
    { field: 'collectionRef', headerName: labels.collection, flex: 1 },
    { field: 'qty', headerName: labels.amount, flex: 1, type: 'number' }
  ]

  const add = () => openForm()
  const edit = obj => openForm(obj)

  const del = async obj => {
    await postRequest({
      extension: SaleRepository.DimensionalTarget.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(obj) {
    stack({
      Component: DimensionalTargetForm,
      props: {
        labels,
        recordId: obj?.recordId,
        maxAccess,
      },
      width: 550,
      height: 450,
      title: labels.dimensionalTarget
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} maxAccess={maxAccess} reportName={'SADTGT'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={'recordId'}
          onEdit={edit}
          onDelete={del}
          pageSize={50}
          paginationType='api'
          paginationParameters={paginationParameters}
          refetch={refetch}
          maxAccess={maxAccess}
        />
      </Grow>
    </VertLayout>
  )
}