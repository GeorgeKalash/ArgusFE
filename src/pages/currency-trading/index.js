import { Box } from '@mui/material'
import { useContext } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import TransactionForm from './forms/TransactionForm'
import { useWindow } from 'src/windows'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { CTTRXrepository } from 'src/repositories/CTTRXRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

export default function CurrencyTrading() {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  function openForm(recordId) {
    stack({
      Component: TransactionForm,
      props: {
        labels,
        maxAccess: access,
        recordId
      },
      width: 1200,
      height: 600,
      title: 'Cash Invoice'
    })
  }

  const {
    query: { data },
    filterBy,
    clearFilter,
    refetch,
    labels: labels,
    access
  } = useResourceQuery({
    endpointId: CTTRXrepository.CurrencyTrading.snapshot,
    datasetId: 35208,
    filter: {
      endpointId: CTTRXrepository.CurrencyTrading.snapshot,
      filterFn: fetchWithSearch
    }
  })
  async function fetchWithSearch({ options = {}, filters }) {
    return await getRequest({
      extension: CTTRXrepository.CurrencyTrading.snapshot,
      parameters: `_filter=${filters.qry}&_category=1`
    })
  }

  return (
    labels &&
    access && (
      <VertLayout>
        <Fixed>
          <GridToolbar
            maxAccess={access}
            onSearch={value => {
              filterBy('qry', value)
            }}
            onSearchClear={() => {
              clearFilter('qry')
            }}
            labels={labels}
            inputSearch={true}
          />
        </Fixed>
        <Grow>
          <Table
            columns={[
              {
                field: 'reference',
                headerName: labels.reference,
                flex: 1
              },
              {
                field: 'createdDate',
                headerName: labels.date,
                flex: 1,
                type: 'date'
              },
              {
                field: 'clientName',
                headerName: labels.name,
                flex: 1
              },
              {
                field: 'amount',
                headerName: labels.amount,
                flex: 1
              },
              {
                field: 'functionName',
                headerName: labels.functionName,
                flex: 1
              },
              {
                field: 'statusName',
                headerName: labels.statusName,
                flex: 1
              },
              {
                field: 'wipName',
                headerName: labels.wipName,
                flex: 1
              }
            ]}
            onEdit={obj => {
              openForm(obj.recordId)
            }}
            gridData={data ? data : { list: [] }}
            rowId={['recordId']}
            isLoading={false}
            pageSize={50}
            paginationType='client'
            refetch={refetch}
            maxAccess={access}
          />
        </Grow>
      </VertLayout>
    )
  )
}
