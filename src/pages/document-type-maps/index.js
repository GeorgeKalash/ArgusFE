import { useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Windows
import DocumentTypeMapWindow from './Windows/DocumentTypeMapWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

const DocumentTypeMaps = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [selectedRecordId, setSelectedRecordId] = useState(null)

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const [selectedFromFunctionId, setSelectedFromFunctionId] = useState(null)
  const [selectedFromDTId, setSelectedFromDTId] = useState(null)
  const [selectedToFunctionId, setSelectedToFunctionId] = useState(null)
  async function fetchGridData() {


    return await getRequest({
      extension: SystemRepository.DocumentTypeMap.qry,
      parameters: `_filter=&_params=`
    })

  }

  const {
    query: { data },
    labels: _labels,
    refetch,
    access
  } = useResourceQuery({
    queryFn:  fetchGridData,
    endpointId: SystemRepository.DocumentTypeMap.qry,
    datasetId: ResourceIds.DocumentTypeMaps
  })


  const columns = [
    {
      field: 'fromFunctionName',
      headerName: 'From Function',
      flex: 1
    },
    {
      field: 'fromDTName',
      headerName: 'From Document',
      flex: 1
    },
    {
      field: 'toFunctionName',
      headerName: 'To Function',
      flex: 1
    },
    {
      field: 'toDTName',
      headerName: 'To Document',
      flex: 1
    }
  ]

  const del = async obj => {
    await postRequest({
      extension: SystemRepository.DocumentTypeMap.del,
      record: JSON.stringify(obj)
    })
    refresh()
    toast.success('Record Deleted Successfully')
  }

  

  const add = () => {
    setWindowOpen(true)
    setSelectedFromFunctionId(null)
    setSelectedFromDTId(null)
    setSelectedToFunctionId(null)
  }

  const edit = obj => {
    
    setSelectedFromFunctionId(obj.fromFunctionId)
    setSelectedFromDTId(obj.fromDTId)
    setSelectedToFunctionId(obj.toFunctionId)
    setWindowOpen(true)
  }

  return (
    <>
      <Box>
        <GridToolbar onAdd={add} maxAccess={access} />
        <Table
          columns={columns}
          gridData={data}
          rowId={['fromFunctionId', 'fromDTId', 'toFunctionId']}
          onEdit={edit}
          onDelete={del}
          refetch={refetch}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <DocumentTypeMapWindow
          onClose={() => {
            setWindowOpen(false)
            setSelectedRecordId(null)
          }}
          labels={_labels}
          maxAccess={access}
          recordId={selectedRecordId}
          setSelectedRecordId={setSelectedRecordId}
          fromFunctionId={selectedFromFunctionId}
          fromDTId={selectedFromDTId}
          toFunctionId={selectedToFunctionId}
          
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default DocumentTypeMaps
