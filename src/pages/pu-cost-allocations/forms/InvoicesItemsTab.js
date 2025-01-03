import React, { useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { CostAllocationRepository } from 'src/repositories/CostAllocationRepository'
import Table from 'src/components/Shared/Table'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const InvoicesItemsTab = ({ store, labels, access }) => {
  const { recordId } = store
  const { getRequest } = useContext(RequestsContext)
  const [valueGridData, setValueGridData] = useState()

  const columns = [
    {
      field: 'sku',
      headerName: labels.sku,
      flex: 1
    },
    {
      field: 'itemName',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'qty',
      headerName: labels.qty,
      flex: 1,
      type: 'number'
    },
    {
      field: 'netPrice',
      headerName: labels.netPrice,
      flex: 1,
      type: 'number'
    }
  ]

  async function fetchGridData() {
    await getRequest({
      extension: CostAllocationRepository.InvoicesItems.qry,
      parameters: `_invoiceId=0&_caId=${recordId}`
    }).then(res => {
      setValueGridData(res)
    })
  }

  useEffect(() => {
    recordId && fetchGridData()
  }, [recordId])

  return (
    <VertLayout>
      <Grow>
        <Table
          name='dstributionTable'
          columns={columns}
          gridData={valueGridData}
          rowId={['recordId']}
          isLoading={false}
          maxAccess={access}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default InvoicesItemsTab
