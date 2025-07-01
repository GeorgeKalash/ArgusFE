import { useContext } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { RGFinancialRepository } from 'src/repositories/RGFinancialRepository'
import { useWindow } from 'src/windows'
import TrialBalanceForm from './forms/TrialBalanceForm'

const FiTrialBalanceGrid = () => {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  async function fetchGridData(options = {}) {
    const response = await getRequest({
      extension: RGFinancialRepository.TrialBalance.FI402View,
      parameters: `_startAt=${0}&_size=${30}&_params=${options.params || ''}`
    })

    return response
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

  const edit = obj => {
    openStack(obj)
  }

  async function openStack(obj) {
    stack({
      Component: TrialBalanceForm,
      props: {
        labels,
        access,
        obj
      },
      width: 1150,
      height: 700

      // title: labels.jobOrder
    })
  }

  console.log('data', data)

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
      </Grow>
    </VertLayout>
  )
}

export default FiTrialBalanceGrid
