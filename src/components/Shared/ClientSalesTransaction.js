import React, { useContext, useState, useEffect } from 'react'
import Grid from '@mui/system/Unstable_Grid/Grid'
import { useFormik } from 'formik'
import { RequestsContext } from 'src/providers/RequestsContext'
import Table from './Table'
import { ResourceLookup } from './ResourceLookup'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useResourceQuery } from 'src/hooks/resource'
import { Grow } from './Layouts/Grow'
import { VertLayout } from './Layouts/VertLayout'

const ClientSalesTransaction = ({ formik }) => {
  const { getRequest } = useContext(RequestsContext)
  const [gridData, setGridData] = useState({})

  console.log(formik.values.clientId, 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')

  async function fetchGridData() {
    const data = await getRequest({
      extension: CashBankRepository.AccountBalance.qry,
      parameters: `_clientId=${formik.values.clientId}`
    })
    setGridData(data)
  }

  useEffect(() => {
    fetchGridData()
  }, [])

  const { labels: _labels, access } = useResourceQuery({
    datasetId: ResourceIds.AccountBalance
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'client',
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
      field: 'description',
      headerName: _labels.description,
      flex: 1,
      type: 'date'
    }
  ]

  return (
    <VertLayout>
      <Grow>
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['clientId']}
          isLoading={!gridData}
          maxAccess={access}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default ClientSalesTransaction
