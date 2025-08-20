import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useWindow } from 'src/windows'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { SystemFunction } from 'src/resources/SystemFunction'
import MaterialTransferDTDForm from './Forms/MaterialTransferDTDForm'

const MaterialTransferDTD = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: InventoryRepository.DocumentTypeDefaults.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=&_functionId=${SystemFunction.MaterialTransfer}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels,
    invalidate,
    refetch,
    access,
    paginationParameters
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.DocumentTypeDefaults.page,
    datasetId: ResourceIds.MaterialTransferDTD
  })

  const columns = [
    {
      field: 'dtName',
      headerName: labels.documentType,
      flex: 1
    },
    {
      field: 'siteName',
      headerName: labels.fromSite,
      flex: 1
    },
    {
      field: 'toSiteName',
      headerName: labels.toSite,
      flex: 1
    },
    {
      field: 'carrierName',
      headerName: labels.carrier,
      flex: 1
    },
    {
      field: 'plantName',
      headerName: labels.plant,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const del = async obj => {
    await postRequest({
      extension: InventoryRepository.DocumentTypeDefaults.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(record) {
    stack({
      Component: MaterialTransferDTDForm,
      props: {
        labels,
        recordId: record?.dtId,
        maxAccess: access
      },
      width: 600,
      height: 500,
      title: labels.MaterialTransferDTD
    })
  }

  const edit = obj => {
    openForm(obj)
  }

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={add} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['dtId']}
          onEdit={edit}
          onDelete={del}
          isLoading={false}
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

export default MaterialTransferDTD
