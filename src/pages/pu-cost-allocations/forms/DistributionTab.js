import React, { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CostAllocationRepository } from 'src/repositories/CostAllocationRepository'
import Table from 'src/components/Shared/Table'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

const DistributionTab = ({ store, labels, access }) => {
  const { recordId } = store
  const { getRequest } = useContext(RequestsContext)

  const columns = [
    {
      field: 'costTypeRef',
      headerName: labels.costTypeRef,
      flex: 1
    },
    {
      field: 'costTypeName',
      headerName: labels.costTypeName,
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
      field: 'baseAmount',
      headerName: labels.baseAmount,
      flex: 1,
      type: 'number'
    }
  ]

  async function fetchGridData() {
    return await getRequest({
      extension: CostAllocationRepository.TrxDstribution.qry,
      parameters: `_recordId=${recordId}`
    })
  }

  const {
    query: { data }
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CostAllocationRepository.TrxDstribution.qry,
    datasetId: ResourceIds.PuCostAllocation,
    enabled: Boolean(recordId)
  })

  return (
    <VertLayout>
      <Grow>
        <Table
          name='distributionTable'
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          isLoading={false}
          maxAccess={access}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default DistributionTab
