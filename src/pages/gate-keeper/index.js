import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import Table from 'src/components/Shared/Table'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'

const GateKeeper = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&_status=2`
    var parameters = defaultParams

    const response = await getRequest({
      extension: ManufacturingRepository.LeanProductionPlanning.preview2,
      parameters: parameters
    })

    if (response && response?.list) {
      response.list = response?.list?.map(item => ({
        ...item,
        balance: item.qty - (item.qtyProduced ?? 0)
      }))
    }

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data },
    labels: _labels,
    refetch,
    access,
    invalidate
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.LeanProductionPlanning.preview2,
    datasetId:  ResourceIds.GateKeeper
  })

  const columns = [
    {
      field: 'sku',
      headerName: _labels[1],
      flex: 1
    },
    {
      field: 'qty',
      headerName: _labels[2],
      flex: 1
    },
    {
      field: 'qtyProduced',
      headerName: _labels.produced,
      flex: 1,
      type: 'number'
    },
    {
      field: 'balance',
      headerName: _labels.balance,
      flex: 1,
      type: 'number'
    },
    {
      field: 'itemName',
      headerName: _labels.itemName,
      flex: 2
    },
    {
      field: 'date',
      label: _labels[6],
      flex: 2,
      type: 'date'
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: ManufacturingRepository.LeanProductionPlanning.cancel,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Cancelled)
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onDelete={del}
          isLoading={false}
          pagination={false}
          refetch={refetch}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default GateKeeper
