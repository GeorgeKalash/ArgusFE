import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import SiteManagementForm from './Forms/SiteManagementForm'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'

const SiteManagement = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params = [] } = options

    const response = await getRequest({
      extension: InventoryRepository.Items.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=&_sortField=sku&_params=${params}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    filterBy,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.Items.page,
    datasetId: ResourceIds.SManagement,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  async function fetchWithFilter({ filters, pagination = {} }) {
    const { _startAt = 0, _size = 50 } = pagination
    if (filters.qry) {
      const response = await getRequest({
        extension: InventoryRepository.Items.snapshot,
        parameters: `_filter=${filters.qry}&_startAt=${_startAt}&_size=${_size}`
      })

      return { ...response, _startAt: _startAt }
    } else return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const columns = [
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'name',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'flName',
      headerName: labels.foreignName,
      flex: 1
    },
    {
      field: 'description',
      headerName: labels.description,
      flex: 1
    },
    {
      field: 'categoryName',
      headerName: labels.category,
      flex: 1
    },
    {
      field: 'msName',
      headerName: labels.measurement,
      flex: 1
    },
    {
      field: 'ptName',
      headerName: labels.priceType,
      flex: 1
    },
    {
      field: 'volume',
      headerName: labels.volume,
      flex: 1,
      type: 'number'
    }
  ]

  function openForm(record) {
    stack({
      Component: SiteManagementForm,
      props: {
        labels,
        record,
        maxAccess: access
      },
      width: 1200,
      height: 700,
      title: labels.SiteManagement
    })
  }

  const edit = obj => {
    openForm(obj)
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar labels={labels} maxAccess={access} reportName={'IVIT'} filterBy={filterBy} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          pageSize={50}
          refetch={refetch}
          paginationType='api'
          paginationParameters={paginationParameters}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default SiteManagement
