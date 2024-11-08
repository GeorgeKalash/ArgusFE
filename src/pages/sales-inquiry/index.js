import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { SaleRepository } from 'src/repositories/SaleRepository'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'

const SalesInquiries = () => {
  const { getRequest } = useContext(RequestsContext)

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, params } = options

    if (params) {
      const response = await getRequest({
        extension: SaleRepository.SalesInquiries.qry,
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_params=${params || ''}&_sortBy=itemId`
      })

      const transformedData = response.list.map((sale) => ({
        ...sale,
        ...sale.itemsSale,
      }));
    
      return { ...response, _startAt, list: transformedData }
    }
    
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const {
    query: { data },
    labels: _labels,
    paginationParameters,
    filterBy,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SaleRepository.SalesInquiries.qry,
    datasetId: ResourceIds.SalesInquiries,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'trxRef',
      headerName: _labels.Ref,
      flex: 1,
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date',
    },
    {
      field: 'clientName',
      headerName: _labels.clientName,
      flex: 1,
    },
    {
      field: 'clientRef',
      headerName: _labels.reference,
      flex: 1,
    },
    {
      field: 'saleZoneName',
      headerName: _labels.saleZoneName,
      flex: 1,
    },
    {
      field: 'itemName',
      headerName: _labels.itemName,
      flex: 1,
    },
    {
      field: 'categoryName', 
      headerName: _labels.categoryName,
      flex: 1,
    },
    {
      field: 'qty',
      headerName: _labels.qty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'basePrice',
      headerName: _labels.basePrice,
      flex: 1,
      type: 'number'
    },
    {
      field: 'unitPrice',
      headerName: _labels.unitPrice,
      flex: 1,
      type: 'number'
    },
    {
      field: 'unitCost',
      headerName: _labels.unitCost,
      flex: 1,
      type: 'number'
    },
    {
      field: 'upo',
      headerName: _labels.overhead,
      flex: 1,
      type: 'number'
    },
    {
      field: 'extendedPrice',
      headerName: _labels.extendedPrice,
      flex: 1,
      type: 'number'
    },
  ];
  


  const onApply = ({ rpbParams }) => {
    filterBy('params', rpbParams)
    refetch()
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar 
        hasSearch={false} 
          labels={_labels} 
          maxAccess={access} 
          onApply={onApply}
          reportName={'SAII'} 
        />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
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

export default SalesInquiries
