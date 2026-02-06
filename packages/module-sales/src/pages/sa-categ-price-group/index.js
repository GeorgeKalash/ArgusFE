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
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import CategoryPriceGroupForm from './Form/CategoryPriceGroupForm'

const CategoryPriceGroup = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: SaleRepository.CategoryPriceGroup.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    })

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const {
    query: { data },
    labels,
    filterBy,
    paginationParameters,
    refetch,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SaleRepository.CategoryPriceGroup.page,
    datasetId: ResourceIds.CategoryPriceGroup,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'pgRef',
      headerName: labels.pgRef,
      flex: 1
    },
    {
      field: 'pgName',
      headerName: labels.pgName,
      flex: 1
    },

    {
      field: 'categoryName',
      headerName: labels.itemCategory,
      flex: 1
    },
    {
      field: 'unitPrice',
      headerName: labels.unitPrice,
      flex: 1,
      type: 'number',
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj)
  }

  async function openForm(record) {
    stack({
      Component: CategoryPriceGroupForm,
      props: {
        labels,
        record,
        recordId: record
          ? String(record.pgId * 10) + String(record.categoryId)
          : null,
        maxAccess: access
      },
      width: 500,
      height: 300,
      title: labels.CategoryPriceGroup
    })
  }

  const del = async obj => {
    await postRequest({
      extension: SaleRepository.CategoryPriceGroup.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar onAdd={add} hasSearch={false} maxAccess={access} reportName={'SAPGC'} filterBy={filterBy} previewReport={ResourceIds.CategoryPriceGroup}/>
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
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

export default CategoryPriceGroup
