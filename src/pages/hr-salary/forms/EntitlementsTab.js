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
import EntitlementForm from './EntitlementForm'

const EntitlementsTab = ({ store, labels, maxAccess, setStore }) => {
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

  const {
    query: { data },
    search,
    clear,
    labels: _labels
  } = useResourceQuery({
    enabled: !!recordId,
    datasetId: ResourceIds.PriceListUpdates,
    queryFn: fetchGridData,
    endpointId: SaleRepository.PriceListItem.qry
  })

  const columns = [
    {
      field: 'entitlements',
      headerName: labels.entitlements,
      flex: 1
    },
    {
      field: 'percentage',
      headerName: labels.percentage,
      flex: 1
    },
    {
      field: 'amount',
      headerName: labels.amount,
      flex: 1
    }
  ]

  const list = data || items

  const add = () => {
    openForm()
  }

  const edit = obj => {
    openForm(obj?.recordId)
  }

  function openForm(recordId) {
    stack({
      Component: EntitlementForm,
      props: {
        labels,
        maxAccess: access,
        recordId
      },
      width: 500,
      height: 250,
      title: labels.entitlements
    })
  }

  const del = async obj => {
    await postRequest({
      extension: AccessControlRepository.NotificationLabel.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success(platformLabels.Deleted)
  }

  return (
    <VertLayout>
      <Fixed>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <GridToolbar onAdd={add} maxAccess={maxAccess} labels={_labels} />
          </Grid>
        </Grid>
      </Fixed>
      <Grow>
        <Table
          name='entitlementsTable'
          columns={columns}
          gridData={list}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default EntitlementsTab
