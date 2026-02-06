import { useContext, useEffect, useState } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Grid } from '@mui/material'
import { RGFinancialRepository } from '@argus/repositories/src/repositories/RGFinancialRepository'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import Table from '@argus/shared-ui/src/components/Shared/Table'

const TrialBalanceForm = ({ access, labels, obj, params }) => {
  const { getRequest } = useContext(RequestsContext)
  const [data, setData] = useState({ list: [] })

  async function fetchGridData() {
    const response = await getRequest({
      extension: RGFinancialRepository.TrialBalance.FI401o2,
      parameters: `_filter=&_size=30&_startAt=0&_fiscalYear=${params?.[1]}&_startDate=${params?.[2]}&_endDate=${params?.[3]}&_accountId=${obj.accountId}&_currencyId=${obj.currencyId}`
    })

    setData(response)
  }

  useEffect(() => {
    fetchGridData()
  }, [])

  const columns = [
    {
      field: 'date',
      headerName: labels.date,
      flex: 1,
      type: 'date'
    },
    {
      field: 'reference',
      headerName: labels.reference,
      flex: 1
    },
    {
      field: 'functionName',
      headerName: labels.functionName,
      flex: 1
    },
    {
      field: 'description',
      headerName: labels.description,
      flex: 1
    },
    {
      field: 'debit',
      headerName: labels.debit,
      flex: 1,
      type: 'number'
    },
    {
      field: 'credit',
      headerName: labels.credit,
      flex: 1,
      type: 'number'
    },
    {
      field: 'runningBalance',
      headerName: labels.runningBalance,
      flex: 1,
      type: 'number'
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <Grid container sx={{ p: 2 }}>
          <Grid item container spacing={2} xs={6}>
            <Grid item xs={12}>
              <CustomTextField label={labels.currency} value={obj.currencyRef} readOnly />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField label={labels.account} value={obj.accountRef} readOnly />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField label={labels.name} value={obj.accountName} readOnly />
            </Grid>
          </Grid>
        </Grid>
      </Fixed>

      <Grow>
        <Table
          name='TrialBalance'
          columns={columns}
          gridData={data}
          pageSize={50}
          paginationType='client'
          refetch={fetchGridData}
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default TrialBalanceForm
