import React, { useContext, useState, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from './Table'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { Grow } from './Layouts/Grow'
import { VertLayout } from './Layouts/VertLayout'
import { SaleRepository } from 'src/repositories/SaleRepository'

const ClientSalesTransaction = ({ functionId, clientId }) => {
  const { getRequest } = useContext(RequestsContext)
  const [data, setData] = useState([])
  async function fetchGridData() {
    const response = await getRequest({
      extension: SaleRepository.SATrx.page,
      parameters: `_functionId=${functionId}&_recordId=${0}&_clientId=${clientId}&_startAt=0&_pageSize=30`
    })
    setData(response || [])
  }

  useEffect(() => {
    fetchGridData()
  }, [])

  const { labels: _labels, access } = useResourceQuery({
    endpointId: SaleRepository.SATrx.page,

    filter: {
      filterFn: fetchGridData,
      default: { functionId }
    },

    datasetId: ResourceIds.ClientSalesTransaction
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'clientName',
      headerName: _labels.client,
      flex: 1
    },
    {
      field: 'date',
      headerName: _labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'baseAmount',
      headerName: _labels.amount,
      flex: 1,
      type: 'number'
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['clientId']}
          isLoading={!data}
          maxAccess={access}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default ClientSalesTransaction
