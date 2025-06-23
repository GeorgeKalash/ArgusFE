import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useWindow } from 'src/windows'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import ItemReplacementForm from './Forms/ItemReplacementForm'
import GridToolbar from 'src/components/Shared/GridToolbar'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'

const ItemReplacement = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: InventoryRepository.Replacement.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_itemId=0`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    paginationParameters,
    refetch,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.Replacement.page,
    datasetId: ResourceIds.ItemReplacement
  })

  const columns = [
    {
      field: 'replacementSKU',
      headerName: labels.replacementSKU,
      flex: 1
    },
    {
      field: 'replacementItemName',
      headerName: labels.replacementItemName,
      flex: 1
    },
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: labels.itemName,
      flex: 1
    }
  ]

  function openForm(record) {
    stack({
      Component: ItemReplacementForm,
      props: {
        labels,
        recordId: record?.itemId,
        maxAccess: access
      },
      width: 800,
      height: 600,
      title: labels.ItemReplacement
    })
  }

  const add = async () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj)
  }

  const del = async obj => {
    await postRequest({
      extension: InventoryRepository.Replacement.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} labels={labels} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['itemId', 'replacementId']}
          onEdit={edit}
          onDelete={del}
          deleteConfirmationType={'strict'}
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

export default ItemReplacement
