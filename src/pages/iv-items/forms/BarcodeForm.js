import { DataGrid } from 'src/components/Shared/DataGrid'
import Table from 'src/components/Shared/Table'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import BarcodesForm from 'src/pages/iv-barcodes/Forms/BarcodesForm'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { useWindow } from 'src/windows'
import { ControlContext } from 'src/providers/ControlContext'
import toast from 'react-hot-toast'

const BarcodeForm = ({ store, labels }) => {
  const { recordId } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const columns = [
    {
      field: 'barcode',
      headerName: labels.barcode,
      flex: 1
    },
    {
      field: 'muName',
      headerName: labels.msUnit,
      flex: 1
    },
    {
      field: 'defaultQty',
      headerName: labels.defaultQty,
      flex: 1
    },
    {
      field: 'isInactive',
      headerName: labels.isInactive,
      flex: 1,
      type: 'checkbox'
    }
  ]

  async function fetchGridData() {
    const response = await getRequest({
      extension: InventoryRepository.Barcode.qry,
      parameters: `_itemId=${recordId}&_pageSize=50&_startAt=0`
    })

    return response
  }

  const {
    query: { data },
    labels: _labels,
    refetch,
    invalidate,
    search,
    access
  } = useResourceQuery({
    enabled: !!recordId,
    datasetId: ResourceIds.Barcodes,
    queryFn: fetchGridData,
    endpointId: InventoryRepository.Barcode.qry,
    search: {
      endpointId: InventoryRepository.Barcodes.snapshot,
      searchFn: fetchWithSearch
    }
  })

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj)
  }

  function openForm(obj) {
    stack({
      Component: BarcodesForm,
      props: {
        labels: _labels,
        recordId: obj?.recordId,
        barcode: obj?.barcode,
        access: access,
        store,
        msId: store?._msId
      },
      width: 750,
      height: 500,
      title: _labels.Barcodes
    })
  }

  
  async function fetchWithSearch({ options = {}, qry }) {
    const { _startAt = 0, _size = 50 } = options

    const response = await getRequest({
      extension: InventoryRepository.Barcodes.snapshot,
      parameters: `_filter=${qry}&_startAt=${_startAt}&_size=${_size}`
    })

    return response
  }

  const del = async obj => {
    await postRequest({
      extension: InventoryRepository.Barcodes.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar 
          onAdd={add} 
          maxAccess={access} 
          onSearch={search}
          inputSearch={true} 
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={'barcode'}
          onEdit={edit}
          onDelete={del}
          deleteConfirmationType={'strict'}
          isLoading={false}
          pageSize={50}
          pagination={false}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default BarcodeForm
