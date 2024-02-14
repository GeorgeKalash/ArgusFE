import { Box } from '@mui/material'
import { useContext, useState } from 'react'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'
import { RequestsContext } from 'src/providers/RequestsContext'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { formatDateDefault } from 'src/lib/date-helper'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { CTTRXrepository } from 'src/repositories/CTTRXRepository'

// ** Windows
import CreditOrderWindow from './Windows/CreditOrderWindow'
import { ResourceIds } from 'src/resources/ResourceIds'

const CreditOrder = () => {
  const { getRequest } = useContext(RequestsContext)
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  

   //states
   const [windowOpen, setWindowOpen] = useState(false)
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
      console.error(error);
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

  const search = inp => {
    setData({count : 0, list: [] , message :"",  statusId:1})
     const input = inp
     if(input){
      var parameters = `_filter=${input}`

    getRequest({
      extension: CTTRXrepository.CurrencyTrading.snapshot,
      parameters: parameters
    })
      .then(res => {
        setData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })

    }else{

      setData({count : 0, list: [] , message :"",  statusId:1})
    }

  }
  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: CTTRXrepository.CreditOrder.qry,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: CTTRXrepository.CreditOrder.qry,
    datasetId: ResourceIds.CreditOrder
  })

  const invalidate = useInvalidate({
    endpointId: CTTRXrepository.CreditOrder.qry
  })
  

  const add = () => {
    setWindowOpen(true)
  }
  
  const edit = obj => {
    setSelectedRecordId(obj.recordId)
    setWindowOpen(true)
  }
  
  const del = async obj => {
    await postRequest({
      extension: CTTRXrepository.CreditOrder.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }


  return (
    <>
      <Box>
          <GridToolbar maxAccess={access} onAdd={add} onSearch={search}  labels={_labels} inputSearch={true}/>
          <Table
            columns={[
              {
                field: 'reference',
                headerName: _labels[4],
                flex: 1
              },
              {
                field: 'date',
                headerName: _labels[2],
                flex: 1,
                valueGetter: ({ row }) => formatDateDefault(row?.date)
              },
              {
                field: 'plantRef',
                headerName: _labels[3]
              },
              {
                field: 'correspondantName',
                headerName: _labels[5],
                flex: 1
              },
              {
                field: 'currencyRef',
                headerName: _labels[8],
                flex: 1
              },
              {
                field: 'amount',
                headerName: _labels[10],
                flex: 1
              }
            ]}
            gridData={data}
            rowId={['recordId']}
            onEdit={edit}
            onDelete={del}
            isLoading={false}
            pageSize={50}
            maxAccess={access}
            paginationType='client'
          />
       </Box>
      {windowOpen && (
        <CreditOrderWindow
          onClose={() =>{setWindowOpen(false)
            setSelectedRecordId(null)
          }}
          labels={_labels}
          maxAccess={access}
          recordId={selectedRecordId}
          setSelectedRecordId={setSelectedRecordId}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage}  />
      </>
  )
}

export default CreditOrder