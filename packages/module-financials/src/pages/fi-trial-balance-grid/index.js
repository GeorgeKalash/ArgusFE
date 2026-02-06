import { useContext, useState } from 'react'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { RGFinancialRepository } from '@argus/repositories/src/repositories/RGFinancialRepository'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import TrialBalanceForm from './forms/TrialBalanceForm'

function formatParams(input) {
  const parts = input?.split('^')
  let result = {}

  for (const part of parts) {
    const [key, value] = part.split('|')
    if (!value || !key) continue

    if (/^\d{8}$/.test(value)) {
      const year = value.substring(0, 4)
      const month = value.substring(4, 6)
      const day = value.substring(6, 8)
      result = { ...result, [key]: `${year}-${month}-${day}` }
    } else {
      result = { ...result, [key]: value }
    }
  }

  return result
}

const FiTrialBalanceGrid = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const [params, setParams] = useState({})

  async function fetchGridData(options = {}) {
    options.params && setParams(formatParams(options.params))

    const response = await getRequest({
      extension: RGFinancialRepository.TrialBalance.FI402View,
      parameters: `_startAt=0&_size=30&_params=${options.params || ''}`
    })

    return {
      ...response,
      list: response?.list.map(item => ({
        ...item,
        opening_base_credit: item.opening_debit - item.opening_credit,
        previous_base_credit: item.previous_debit - item.previous_credit,
        period_balance: item.period_debit - item.period_credit,
        final_balance: item.balance_debit - item.balance_credit
      }))
    }
  }

  async function fetchWithFilter({ filters }) {
    return fetchGridData({ params: filters?.params })
  }

  const {
    query: { data },
    labels,
    filterBy,
    refetch,
    access
  } = useResourceQuery({
    endpointId: RGFinancialRepository.TrialBalance.FI402View,
    datasetId: ResourceIds.FITrialBalanceGridView,
    queryFn: fetchGridData,
    filter: {
      filterFn: fetchWithFilter
    },
    defaultLoad: false
  })

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
      flex: 1,
      type: 'number'
    },
    {
      field: 'period_credit',
      headerName: labels.periodCredit,
      flex: 1,
      type: 'number'
    },
    {
      field: 'period_balance',
      headerName: labels.periodBalance,
      flex: 1,
      type: 'number'
    },
    {
      field: 'final_balance',
      headerName: labels.finalBalance,
      flex: 1,
      type: 'number'
    }
  ]

  const edit = obj => {
    openStack(obj)
  }

  async function openStack(obj) {
    stack({
      Component: TrialBalanceForm,
      props: {
        labels,
        access,
        obj,
        params
      },
      width: 1000,
      height: 700,
      title: labels.statementOfAccount
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar maxAccess={access} filterBy={filterBy} reportName={'FI01'} hasSearch={false} />
      </Fixed>
      <Grow>
        <Table
          name='table'
          columns={columns}
          gridData={data}
          onEdit={edit}
          isLoading={false}
          pageSize={50}
          refetch={refetch}
          paginationType='client'
          maxAccess={access}
        />
      </Grow>
    </VertLayout>
  )
}

export default FiTrialBalanceGrid
