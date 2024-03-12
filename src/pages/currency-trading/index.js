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
import { SystemRepository } from 'src/repositories/SystemRepository'
import { CTTRXrepository } from 'src/repositories/CTTRXRepository'
import useResourceParams from 'src/hooks/useResourceParams'

export default function CurrencyTrading() {
  const { getRequest } = useContext(RequestsContext)

  const { stack } = useWindow()

 //error
 const [errorMessage, setErrorMessage] = useState(null)

 const getPlantId = async () => {
  const userData = window.sessionStorage.getItem('userData')
    ? JSON.parse(window.sessionStorage.getItem('userData'))
    : null;

  const parameters = `_userId=${userData && userData.userId}&_key=plantId`;

  try {
    const res = await getRequest({
      extension: SystemRepository.UserDefaults.get,
      parameters: parameters,
    });

    if (res.record.value) {
      return res.record.value;
    }

    return '';
  } catch (error) {
    setErrorMessage(error);

     return '';
  }
};
 async function openFormWindow(recordId) {
    if(!recordId){
    try {
      const plantId = await getPlantId();
      if (plantId !== '') {
        openForm('' , plantId)
      } else {
        setErrorMessage({ error: 'The user does not have a default plant' });
      }
    } catch (error) {
    }}else{
      openForm(recordId)
    }

  }
function openForm(recordId,plantId ){
  stack({
    Component: TransactionForm,
    props: {
      labels,
      maxAccess: access,
      plantId: plantId,
      recordId
    },
    width: 1200,
    height:600,
    title: 'Cash Invoice'
  })
}



const {
  query: { data },
  search,
  clear,
  labels: labels,
  access
} = useResourceQuery({
  endpointId: CTTRXrepository.CurrencyTrading.snapshot,
  datasetId: 35208,
  search: {
    endpointId: CTTRXrepository.CurrencyTrading.snapshot,
    searchFn: fetchWithSearch,
  }
})
async function fetchWithSearch({options = {} , qry}) {
  const { _startAt = 0, _pageSize = 50 } = options

  return await getRequest({
        extension: CTTRXrepository.CurrencyTrading.snapshot,
        parameters: `_filter=${qry}&_category=1`
      })
    }

return (
    <Box>
      { labels && access && (
        <>
          <GridToolbar maxAccess={access}  onSearch={search} onSearchClear={clear}  labels={labels} inputSearch={true}/>
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
            gridData={data ? data : {list: []}}
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
