import React, { useContext, useState, useEffect } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from './Table'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const ClientSalesTransaction = ({ functionId, clientId, window }) => {
  const { getRequest } = useContext(RequestsContext)
  const [data, setData] = useState([])
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.ClientSalesTransaction, window })

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

ClientSalesTransaction.width = 600
ClientSalesTransaction.height = 450

export default ClientSalesTransaction
