import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { useWindow } from 'src/windows'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import ItemPartForm from './forms/ItemPartForm'

const ItemParts = () => {
  const { getRequest } = useContext(RequestsContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: InventoryRepository.IVMDParts.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=&_sortField=recordId desc`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    refetch,
    paginationParameters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.IVMDParts.qry,
    datasetId: ResourceIds.IVMDParts
  })

  const columns = [
    {
      field: 'sku',
      headerName: _labels.sku,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'flName',
      headerName: _labels.flName,
      flex: 1
    },
    {
      field: 'shortName',
      headerName: _labels.shortName,
      flex: 1
    },
    {
      field: 'description',
      headerName: _labels.description,
      flex: 1
    },
    {
      field: 'categoryName',
      headerName: _labels.categories,
      flex: 1
    },
    {
      field: 'msName',
      headerName: _labels.measurement,
      flex: 1
    },
    {
      field: 'ptName',
      headerName: _labels.priceType,
      flex: 1
    },
    {
      field: 'volume',
      headerName: _labels.volume,
      flex: 1
    },
    {
      field: 'weight',
      headerName: _labels.weight,
      flex: 1
    }
  ]

  const edit = obj => {
    openForm(obj)
  }

  function openForm(obj) {
    stack({
      Component: ItemPartForm,
      props: {
        labels: _labels,
        obj,
        maxAccess: access
      },
      width: 700,
      height: 470,
      title: _labels.itemParts
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={edit}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default ItemParts
