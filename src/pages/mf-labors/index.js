import { useState, useContext } from 'react'

// ** MUI Imports
import {Box } from '@mui/material'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'

import { ManufacturingRepository } from 'src/repositories/ManufacturingRepository'

// ** Windows
import LaborsWindow from './window/LaborsWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'




const Labor = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
 
  const [selectedRecordId, setSelectedRecordId] = useState(null)

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)


  

  async function fetchGridData(options = {}) {
    const { _startAt = 0, _pageSize = 50 } = options

    return await getRequest({
      extension: ManufacturingRepository.Labor.page,
      parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=&_params=`
    })
  }

  const {
    query: { data },
    labels: _labels,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: ManufacturingRepository.Labor.page,
    datasetId: ResourceIds.Labor
  })

  const invalidate = useInvalidate({
    endpointId: ManufacturingRepository.Labor.page
  })

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'workCenterName',
      headerName: _labels.workCenter,
      flex: 1
    },
    {
      field: 'operationName',
      headerName: _labels.operation,
      flex: 1
    },
    {
      field: 'userName',
      headerName: _labels.user,
      flex: 1
    }
   
  ]


  const add = () => {
    setWindowOpen(true)
 
  }

  const edit = obj => {
    setSelectedRecordId(obj.recordId)
    setWindowOpen(true)
 
   

  }

  const del = async obj => {
    await postRequest({
      extension: ManufacturingRepository.Labor.del,
      record: JSON.stringify(obj)
    })
    invalidate()
    toast.success('Record Deleted Successfully')
  }
  

  return (
    <>
      <Box>
        <GridToolbar onAdd={add} maxAccess={access} />
        <Table
          columns={columns}
          gridData={data}
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
        <LaborsWindow
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




export default Labor


