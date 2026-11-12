import Table from '@argus/shared-ui/src/components/Shared/Table'
import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import BarcodesForm from '@argus/shared-ui/src/components/Shared/Forms/BarcodesForm'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import toast from 'react-hot-toast'

const BarcodeForm = ({ store, labels }) => {
  const { recordId, barcodes } = store
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const [gridData, setGridData] = useState({ list: [] })

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

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: InventoryRepository.Barcode.qry,
      parameters: `_itemId=${recordId}&_pageSize=${_pageSize}&_startAt=${_startAt}`
    })

    setGridData(response)

    return { ...response, _startAt: _startAt }
  }

  async function fetchWithSearch({ qry }) {
    const response = await getRequest({
      extension: InventoryRepository.Barcodes.snapshot2,
      parameters: `_filter=${qry}&_itemId=${recordId}`
    })

    setGridData(response)

    return response
  }

  const {
    labels: _labels,
    search,
    clear,
    access,
    refetch,
    paginationParameters
  } = useResourceQuery({
    queryFn: fetchGridData,
    enabled: !!recordId,
    endpointId: InventoryRepository.Barcode.qry,
    datasetId: ResourceIds.Barcodes,
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
        access,
        store,
        msId: store?._msId,
        onSuccess
      },
      title: _labels.Barcodes
    })
  }

  useEffect(() => {
    setGridData({ list: barcodes || [] })
  }, [barcodes])

  const del = async obj => {
    await postRequest({
      extension: InventoryRepository.Barcodes.del,
      record: JSON.stringify(obj)
    })

    onSuccess?.()

    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onAdd={add}
          maxAccess={access}
          onSearch={search}
          onSearchClear={clear}
          inputSearch={true}
        />
      </Fixed>
      <Grow>
        <Table
          name='barcodeTable'
          columns={columns}
          gridData={gridData}
          rowId={'recordId'}
          onEdit={edit}
          onDelete={del}
          deleteConfirmationType={'strict'}
          paginationType='api'
          paginationParameters={paginationParameters}
          maxAccess={access}
          refetch={refetch}
        />
      </Grow>
    </VertLayout>
  )
}

export default BarcodeForm