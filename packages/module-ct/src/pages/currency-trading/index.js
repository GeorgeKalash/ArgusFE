import { Box } from '@mui/material'
import { useContext } from 'react'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import TransactionForm from '@argus/shared-ui/src/components/Shared/Forms/TransactionForm'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import { CTTRXrepository } from '@argus/repositories/src/repositories/CTTRXRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

export default function CurrencyTrading() {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  function openForm(recordId) {
    stack({
      Component: TransactionForm,
      props: {
        recordId
      }
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
    datasetId: ResourceIds.CashInvoice,
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
