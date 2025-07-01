import { useContext, useEffect } from 'react'
import { DataGrid } from 'src/components/Shared/DataGrid'
import FormShell from 'src/components/Shared/FormShell'
import { RequestsContext } from 'src/providers/RequestsContext'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { DataSets } from 'src/resources/DataSets'
import { Grid, Table } from '@mui/material'
import { RGFinancialRepository } from 'src/repositories/RGFinancialRepository'
import { useResourceQuery } from 'src/hooks/resource'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import CustomTextField from 'src/components/Inputs/CustomTextField'

const TrialBalanceForm = ({ maxAccess, labels, obj }) => {
  const { getRequest } = useContext(RequestsContext)

  // async function fetchGridData() {
  //   const response = await getRequest({
  //     extension: RGFinancialRepository.TrialBalance.FI401o2,
  //     parameters: `_filter=&_size=30&_startAt=0&_fiscalYear=2025&_startDate=2025-01-01&_endDate=2025-07-01&_accountId=2&_currencyId=1`
  //   })

  //   return response
  // }

  // const {
  //   query: { data },

  //   // labels,
  //   filterBy,
  //   refetch

  //   // access
  // } = useResourceQuery({
  //   endpointId: RGFinancialRepository.TrialBalance.FI401o2,

  //   // datasetId: ResourceIds.FITrialBalanceGridView,
  //   queryFn: fetchGridData
  // })

  const columns = [
    {
      field: 'currencyRef',
      headerName: labels.currency,
      flex: 1
    },

    {
      field: 'accountRef',
      headerName: labels.account,
      flex: 1
    },

    {
      field: 'accountName',
      headerName: labels.name,
      flex: 1
    },
    {
      field: 'opening_base_credit',
      headerName: labels.opening,
      flex: 1,
      type: 'number'
    },
    {
      field: 'previous_base_credit',
      headerName: labels.previous,
      flex: 1,
      type: 'number'
    },
    {
      field: 'period_debit',
      headerName: labels.periodDebit,
      flex: 1
    },
    {
      field: 'balance_credit',
      headerName: labels.periodCredit,
      flex: 1
    },
    {
      field: 'balance_debit',
      headerName: labels.periodBalance,
      flex: 1
    },
    {
      field: 'balance_credit',
      headerName: labels.finalBalance,
      flex: 1
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <Grid container spacing={1} sx={{ p: 2 }}>
          <Grid item xs={6}>
            <CustomTextField label={labels.sku} value={obj.currencyRef} readOnly />
          </Grid>
          <Grid item xs={6}></Grid>
          <Grid item xs={6}>
            <CustomTextField label={labels.itemName} value={obj.accountRef} readOnly />
          </Grid>
          <Grid item xs={7}></Grid>
          <Grid item xs={6}>
            <CustomTextField label={labels.itemName} value={obj.name} readOnly />
          </Grid>
        </Grid>
      </Fixed>
      {/* <Grow>
        <Table
          name='TrialBalance'
          columns={columns}
          gridData={data}
          rowId={['accountId', 'currencyId', 'fiscalYear']}
          onEdit={edit}
          isLoading={false}
          pageSize={50}
          disableSorting={true}
          refetch={refetch}
          paginationType='client'
          maxAccess={access}
          pagination={true}
        />
      </Grow> */}
    </VertLayout>
  )
}

export default TrialBalanceForm
