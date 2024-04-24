import { useContext } from 'react'
import { Box } from '@mui/material'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { FinancialRepository } from 'src/repositories/FinancialRepository'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'

const AccountBalanceForm = (
 { 
  labels,
  maxAccess,
  store,
}) => {
  const { getRequest} = useContext(RequestsContext)
  const { recordId } = store
  var editMode = recordId? true: false

  const columns = [
    {
      field: 'currencyName',
      headerName: labels.currency,
      flex: 1
    },
    {
      field: 'balance',
      headerName: labels.balance,
      flex: 1
    }
  ]

  async function fetchGridData(options={}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&_accountId=${recordId}`
    var parameters = defaultParams

     const response =  await getRequest({
      extension: FinancialRepository.AccountCreditBalance.qry,
      parameters: parameters
    })

    return {...response,  _startAt: _startAt}
  }

  const {
    query: { data },
  } = useResourceQuery({
    enabled: editMode,
    queryFn: fetchGridData,
    endpointId: FinancialRepository.AccountCreditBalance.qry,
    datasetId: ResourceIds.Accounts,
  })

  return (
    <>
      <Table
        columns={columns}
        gridData={{list: [...data.list, ...data.list, ...data.list]}}
        rowId={['currencyId']}
        isLoading={false}
        maxAccess={maxAccess}
        pagination={false}
        autoHeight={true}
      />
    </>
  )
}

export default AccountBalanceForm
