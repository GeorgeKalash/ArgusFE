import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import MetalsWindows from './Window/MetalsWindow'
import { InventoryRepository } from '@argus/repositories/src/repositories/InventoryRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const TaxCodes = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: InventoryRepository.Metals.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    invalidate,
    refetch,
    paginationParameters,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: InventoryRepository.Metals.page,
    datasetId: ResourceIds.Metals
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'purity',
      headerName: _labels.purity,
      flex: 1
    },
    {
      field: 'currencyRef',
      headerName: _labels.currency,
      flex: 1
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  const del = async obj => {
    try {
      await postRequest({
        extension: InventoryRepository.Metals.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success(platformLabels.Deleted)
    } catch (e) {}
  }

  function openForm(recordId) {
    stack({
      Component: MetalsWindows,
      props: {
        labels: _labels,
        recordId: recordId,
        maxAccess: access
      },
      width: 800,
      height: 460,
      title: _labels.metals
    })
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
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
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

export default TaxCodes
