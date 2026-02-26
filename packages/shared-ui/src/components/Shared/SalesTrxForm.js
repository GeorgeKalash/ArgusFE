import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { SaleRepository } from '@argus/repositories/src/repositories/SaleRepository'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const SalesTrxForm = ({ functionId, recordId, itemId, clientId, window }) => {
  const { getRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.SalesTransactions, window })

  const {
    query: { data },
    labels: labels,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: SaleRepository.SATrx.qry,
    datasetId: ResourceIds.SalesTrxForm
  })

  const columns = [
    {
      field: 'reference',
      headerName: labels.reference,
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
      field: 'qty',
      headerName: labels.qty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'unitPrice',
      headerName: labels.unitPrice,
      flex: 1,
      type: 'number'
    },
    {
      field: 'baseAmount',
      headerName: labels.baseAmount,
      flex: 1,
      type: 'number'
    },
    {
      field: 'baseCost',
      headerName: labels.baseCost,
      flex: 1,
      type: 'number'
    },
    {
      field: 'baseVatAmount',
      headerName: labels.baseVatAmount,
      flex: 1,
      type: 'number'
    },
    {
      field: 'baseDiscount',
      headerName: labels.baseDiscount,
      flex: 1,
      type: 'number'
    }
  ]

  async function fetchGridData() {
    const res = await getRequest({
      extension: SaleRepository.SATrx.qry,
      parameters: `_functionId=${parseInt(functionId)}&_recordId=${parseInt(recordId)}&_itemId=${parseInt(
        itemId
      )}&_clientId=${parseInt(clientId)}`
    })
    res.list = res?.list?.map(item => ({
      ...item,
      unitPrice: parseFloat(item?.baseAmount / item?.qty).toFixed(2)
    }))

    return res
  }

  return (
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={data}
          rowId={['itemId']}
          pagination={false}
          maxAccess={access}
          refetch={refetch}
        />
      </Grow>
    </VertLayout>
  )
}

SalesTrxForm.width = 1200

export default SalesTrxForm
