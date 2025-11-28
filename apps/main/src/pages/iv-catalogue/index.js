import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import CatalogueForm from './Forms/CatalogueForm'

const Catalogue = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: InventoryRepository.Catalogue.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}`
    })

    if (response && response?.list) {
      response.list = response?.list?.map(item => ({
        ...item,
        onHand: parseFloat(item?.onHand).toFixed(3)
      }))
    }

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithFilter({ filters, pagination }) {
    if (filters?.qry) {
      return await getRequest({
        extension: InventoryRepository.Catalogue.snapshot,
        parameters: `_filter=${filters.qry}`
      })
    } else {
      return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
    }
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    access,
    filterBy
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.Catalogue.page,
    datasetId: ResourceIds.Catalogue,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'pictureUrl',
      headerName: '',
      type: 'image',
      flex: 0.5
    },
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
      field: 'groupName',
      headerName: labels.group,
      flex: 1
    },
    {
      field: 'categoryName',
      headerName: labels.category,
      flex: 1
    },
    {
      field: 'onHand',
      headerName: labels.onHand,
      flex: 1,
      type: 'number'
    }
  ]

  const edit = obj => {
    openForm(obj)
  }

  function openForm(record) {
    stack({
      Component: CatalogueForm,
      props: {
        labels,
        maxAccess: access,
        record
      },
      width: 1000,
      height: 600,
      title: labels.Catalogue
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          maxAccess={access}
          reportName={'IVIT'}
          filterBy={filterBy}
          previewReport={ResourceIds.Catalogue}
        />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data ?? { list: [] }}
          rowId={['recordId']}
          onEdit={edit}
          pageSize={50}
          paginationType='api'
          maxAccess={access}
          refetch={refetch}
          paginationParameters={paginationParameters}
        />
      </Grow>
    </VertLayout>
  )
}

export default Catalogue
