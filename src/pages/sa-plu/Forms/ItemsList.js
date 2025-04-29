import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { Grid } from '@mui/material'

const ItemsList = ({ store, labels, maxAccess }) => {
  const { getRequest } = useContext(RequestsContext)
  const { recordId, items } = store

  async function fetchGridData() {
    const response = await getRequest({
      extension: SaleRepository.PriceListItem.qry,
      parameters: `_pluId=${recordId}&_itemId=0`
    })

    setStore(prevStore => ({
      ...prevStore,
      items: response?.count == 0 ? items : response
    }))

    return response
  }

  async function fetchWithSearch({ qry }) {
    const response = await getRequest({
      extension: SaleRepository.PriceListItem.snapshot,
      parameters: `_filter=${qry}&_pluId=${recordId}`
    })

    return response
  }

  const {
    query: { data },
    search,
    clear,
    labels: _labels
  } = useResourceQuery({
    enabled: !!recordId,
    datasetId: ResourceIds.PriceListUpdates,
    queryFn: fetchGridData,
    endpointId: SaleRepository.PriceListItem.qry,
    search: {
      searchFn: fetchWithSearch
    }
  })

  const columns = [
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: labels.item,
      flex: 1
    },
    {
      field: 'plName',
      headerName: labels.priceLevel,
      flex: 1
    },
    {
      field: 'ptName',
      headerName: labels.priceType,
      flex: 1
    },
    {
      field: 'currencyRef',
      headerName: labels.currency,
      flex: 1
    },
    {
      field: 'value',
      headerName: labels.price,
      flex: 1,
      type: 'number'
    }
  ]

  const list = data || items

  return (
    <VertLayout>
      <Fixed>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <GridToolbar
              maxAccess={maxAccess}
              onSearch={search}
              onSearchClear={clear}
              labels={_labels}
              inputSearch={true}
            />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={list}
          rowId={['recordId']}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default ItemsList
