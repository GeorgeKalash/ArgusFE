import React, { useContext } from 'react'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'

const HistoryList = ({ recordId }) => {
  const { getRequest } = useContext(RequestsContext)

  const {
    query: { data },
    labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SaleRepository.PriceListItem.qry,
    datasetId: ResourceIds.PriceListUpdates
  })

  const columns = [
    {
      field: 'pluRef',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'pluDate',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    ,
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

  async function fetchGridData() {
    return await getRequest({
      extension: SaleRepository.PriceListItem.qry,
      parameters: `_pluId=0&_itemId=${recordId}&_filter=`
    })
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          table='history'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          maxAccess={access}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default HistoryList
