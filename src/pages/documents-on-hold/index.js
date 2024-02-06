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

const DocumentsOnHold = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
 
  const [selectedRecordId, setSelectedRecordId] = useState(null)

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [gridData ,setGridData]=useState([]);

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50, _reference = '' } = options;
  
    return await getRequest({
      extension: 'DR.asmx/qryTRX', // Updated API endpoint
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&_functionId=0&_response=0&_status=1&_reference=${_reference}&_sortBy=reference desc`
    });
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
        flex: 1
      }

  ]

  const search = inp => {
    setSearchValue(inp);
    const input = inp.trim().toLowerCase(); 
  
    if (Array.isArray(data.list)) {
      if (input) {
        const filteredList = data.list.filter(item =>
          Object.values(item).some(value =>
            typeof value === "string" && value.toLowerCase().includes(input)
          )
        );
        setGridData({ list: filteredList });
      } else {
        // If input is empty, show all data
        setGridData(data);
      }
    } else {
      console.error("Data list is not an array:", data.list);
    }
  };

  const edit = obj => {
    setSelectedRecordId(obj.recordId)
    setWindowOpen(true)
  }

  const del = async obj => {
    await postRequest({
      extension: DocumentReleaseRepository.DocumentsOnHold.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }
  

  return (
    <>
      <Box>
        <GridToolbar  maxAccess={access} onSearch={search} onSearchClear={onSearchClear} labels={_labels}  inputSearch={true} />
        <Table
          columns={columns}
          gridData={searchValue.length > 0 ? gridData : data}
          rowId={['recordId']}
          onEdit={edit}
          onDelete={del}
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
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default DocumentsOnHold
