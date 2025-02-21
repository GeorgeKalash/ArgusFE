import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { ReportIvGenerator } from 'src/repositories/ReportIvGeneratorRepository'

const PriceListInquiries = () => {
  const { getRequest } = useContext(RequestsContext)

  async function fetchWithFilter({ filters }) {
    if (filters?.qry) {
      return await getRequest({
        extension: ReportIvGenerator.Report451,
        parameters: `_filter=${filters.qry}`
      })
    }
  }

  const {
    query: { data },
    labels: _labels,
    filterBy,
    clearFilter,
    access
  } = useResourceQuery({
    endpointId: ReportIvGenerator.Report451,
    datasetId: ResourceIds.PriceListInquiry,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'sku',
      headerName: _labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: _labels.itemName,
      flex: 2
    },
    {
      field: 'priceLevelRef',
      headerName: _labels.priceLevel,
      flex: 1
    },
    {
      field: 'currencyRef',
      headerName: _labels.currency,
      flex: 1
    },
    {
      field: 'muRef',
      headerName: _labels.mu,
      flex: 1
    },
    {
      field: 'priceType',
      headerName: _labels.priceType,
      flex: 1
    },
    {
      field: 'price',
      headerName: _labels.price,
      flex: 1,
      type: 'number'
    },
    {
      field: 'onhand',
      headerName: _labels.onhand,
      flex: 1,
      type: 'number'
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar
          onSearch={value => {
            filterBy('qry', value)
          }}
          onSearchClear={() => {
            clearFilter('qry')
          }}
          labels={_labels}
          maxAccess={access}
          inputSearch={true}
        />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data || { list: [] }}
          rowId={['recordId']}
          pagination={false}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default PriceListInquiries
