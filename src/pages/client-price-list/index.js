import { useContext } from 'react'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useWindow } from 'src/windows'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { SaleRepository } from 'src/repositories/SaleRepository'
import ClientPriceListForm from './Forms/ClientPriceListForm'
import { ControlContext } from 'src/providers/ControlContext'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'

const ClientPriceList = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    const response = await getRequest({
      extension: SaleRepository.ClientPriceList.page,
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
    paginationParameters,
    filterBy,
    refetch,
    invalidate,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SaleRepository.ClientPriceList.page,
    datasetId: ResourceIds.ClientPriceLists,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'clientRef',
      headerName: labels.clientRef,
      flex: 1
    },
    {
      field: 'clientName',
      headerName: labels.clientName,
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
    },
    {
      field: 'currencyRef',
      headerName: labels.currency,
      flex: 1
    },
    {
      field: 'ptName',
      headerName: labels.priceType,
      flex: 1
    },
    {
      field: 'unitPrice',
      headerName: labels.unitPrice,
      flex: 1,
      type: 'number'
    }
  ]

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj)
  }

  const del = async obj => {
    await postRequest({
      extension: SaleRepository.ClientPriceList.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  function openForm(record) {
    stack({
      Component: ClientPriceListForm,
      props: {
        labels,
        recordId: record
          ? String(record.itemId * 1000) +
            String(record.clientId * 100) +
            String(record.currencyId * 10) +
            String(record.priceType)
          : null,
        record,
        maxAccess: access
      },
      width: 600,
      height: 500,
      title: labels.ClientPriceList
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar hasSearch={false} onAdd={add} maxAccess={access} filterBy={filterBy} reportName={'SAPRC'} />
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
          paginationParameters={paginationParameters}
          paginationType='api'
          maxAccess={access}
          refetch={refetch}
        />
      </Grow>
    </VertLayout>
  )
}

export default ClientPriceList
