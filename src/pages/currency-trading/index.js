import { Box } from '@mui/material'
import { useContext, useState } from 'react'
import { useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import TransactionForm from './forms/TransactionForm'
import { useWindow } from 'src/windows'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { formatDateDefault, formatDateFromApi } from 'src/lib/date-helper'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

export default function CurrencyTrading() {
  const { getRequest } = useContext(RequestsContext)

  const { stack } = useWindow()

 //error
 const [errorMessage, setErrorMessage] = useState(null)

  function openFormWindow(recordId) {
    stack({
      Component: TransactionForm,
      props: {
        labels,
        maxAccess: access,
        recordId
      },
      width: 1200,
      height:600,
      title: 'Cash Invoice'
    })
  }

  const {
    access,
    labels,
    isLoading,
    query: { data }
  } = useResourceQuery({
    datasetId: 35208,
    endpointId: 'CTTRX.asmx/pageCIV',
    async queryFn(options = {}) {
      const { _startAt = 0, _pageSize = 50 } = options

      return await getRequest({
        extension: 'CTTRX.asmx/pageCIV',
        parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
      })
    }
  })

  return (
    <Box>
      {!isLoading && labels && access && (
        <>
          <GridToolbar onAdd={() => openFormWindow()} maxAccess={access} />
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
                valueGetter: ({ row }) => formatDateDefault(row?.date)
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
              openFormWindow(obj.recordId)
            }}
            gridData={data}
            rowId={['recordId']}
            isLoading={false}
            pageSize={50}
            paginationType='client'
            maxAccess={access}
          />
        </>
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage}  />

    </Box>
  )
}
