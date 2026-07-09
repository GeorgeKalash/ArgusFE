import { useContext } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { FinancialRepository } from '@argus/repositories/src/repositories/FinancialRepository'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import AccountSummary from '@argus/shared-ui/src/components/Shared/AccountSummary'

const AccountBalanceForm = ({ labels, maxAccess, store }) => {
  const { getRequest } = useContext(RequestsContext)
  const { recordId: accountId } = store
  const { stack } = useWindow()
  const editMode = !!accountId

  const columns = [
    {
      field: 'currencyName',
      headerName: labels.currency,
      flex: 1
    },
    {
      field: 'balance',
      headerName: labels.balance,
      flex: 1,
      type: 'number'
    }
  ]

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const response = await getRequest({
      extension: FinancialRepository.AccountCreditBalance.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_accountId=${recordId}`
    })

    return { ...response, _startAt: _startAt }
  }

  const {
    query: { data }
  } = useResourceQuery({
    enabled: editMode,
    queryFn: fetchGridData,
    endpointId: FinancialRepository.AccountCreditBalance.qry,
    datasetId: ResourceIds.Accounts
  })

  const actions = [
    {
      key: 'AccountSummary',
      condition: true,
      onClick: () => {
        stack({
          Component: AccountSummary,
          props: { 
            accountId,
            date: new Date()
          }
        })
      },
      disabled: !accountId
    }
  ]

  return (
    <Form actions={actions} maxAccess={maxAccess} isParentWindow={false} isSaved={false} fullSize>
      <VertLayout>
        <Grow>
          <Table
            name='accountBalance'
            columns={columns}
            gridData={data}
            rowId={['currencyId']}
            maxAccess={maxAccess}
            pagination={false}
          />
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default AccountBalanceForm
