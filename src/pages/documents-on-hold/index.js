// ** React Imports
import { useState, useContext } from 'react'

// ** MUI Imports
import {Box } from '@mui/material'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'

import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'

// ** Windows
import DocumentsWindow from './window/DocumentsWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

import { formatDateDefault } from 'src/lib/date-helper';

const DocumentsOnHold = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
 
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  const [selectedFunctioId, setSelectedFunctioId] = useState(null)
  const [selectedSeqNo, setSelectedSeqNo] = useState(null)


  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [gridData, setGridData] = useState([]);


  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 100 } = options
    console.log('request')
    

    return await getRequest({
      extension: DocumentReleaseRepository.DocumentsOnHold.qry,
      parameters: `_startAt=${_startAt}&_functionId=0&_reference=&_sortBy=reference desc&_response=0&_status=1&_pageSize=${_pageSize}&filter=`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: DocumentReleaseRepository.DocumentsOnHold.qry,
    datasetId: ResourceIds.DocumentsOnHold
  })

  const invalidate = useInvalidate({
    endpointId: DocumentReleaseRepository.DocumentsOnHold.qry
  })
  const [searchValue, setSearchValue] = useState("")

  function onSearchClear() {
    setSearchValue('')
    setGridData({count : 0, list: [] , message :"",  statusId:1})
  }

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'functionName',
      headerName: _labels.functionName,
      flex: 1
    },  {
        field: 'thirdParty',
        headerName: _labels.thirdParty,
        flex: 1
      },  {
        field: 'date',
        headerName: _labels.date,
        flex: 1,
        valueGetter: ({ row }) => formatDateDefault(row?.date)

      }

  ]


  const edit = obj => {
   
    setSelectedSeqNo(obj.seqNo)
    setSelectedRecordId(obj.recordId)
    setSelectedFunctioId(obj.functionId)
    setWindowOpen(true)
  }


  const search = inp => {
    setSearchValue(inp)    
    setGridData({count : 0, list: [] , message :"",  statusId:1})
     const input = inp
     

     if(input){
    var parameters =  `_startAt=0&_functionId=0&_reference=${input}&_sortBy=reference desc&_response=0&_status=1&_pageSize=50`

    getRequest({
      extension:DocumentReleaseRepository.DocumentsOnHold.qry ,
      parameters: parameters
    })

      .then(res => {
        setGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })

    }else{

      setGridData({count : 0, list: [] , message :"",  statusId:1})
    }
    
  }


  return (
    <>
      <Box>
        <GridToolbar  maxAccess={access} onSearch={search} onSearchClear={onSearchClear} labels={_labels}  inputSearch={true} />
        <Table
          columns={columns}
          gridData={searchValue.length > 0 ? gridData : data}
          rowId={['functionId',"seqNo","recordId"]}
          onEdit={edit}

          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <DocumentsWindow
          onClose={() => {
            setWindowOpen(false)
            setSelectedRecordId(null)
          }}
          labels={_labels}
          maxAccess={access}
          recordId={selectedRecordId}
          setSelectedRecordId={setSelectedRecordId}
          functionId={selectedFunctioId}
          seqNo={selectedSeqNo}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default DocumentsOnHold
