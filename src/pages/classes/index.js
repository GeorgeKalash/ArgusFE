// ** React Importsport
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
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Windows
import ClassesWindow from './Windows/ClassesWindow'

// ** Helpers
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'

const Classes = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  //control

  const {
    query: { data },
    labels : _labels,
    paginationParameters,
    invalidate,
    refetch,
    access
  } = useResourceQuery({
     queryFn: fetchGridData,
     endpointId: DocumentReleaseRepository.Class.qry,
     datasetId: ResourceIds.Classes,
   })

  async function fetchGridData(options={}) {
    const { _startAt = 0, _pageSize = 50 } = options

    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams

     const response =  await getRequest({
      extension: DocumentReleaseRepository.Class.qry,
      parameters: parameters
    })

    return {...response,  _startAt: _startAt}
  }

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    }
  ]

  const delClasses = obj => {
    postRequest({
      extension: DocumentReleaseRepository.Class.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Deleted Successfully')
        invalidate()
      })
  }

  const addClasses = () => {
    openForm('')
  }

  function openForm (recordId){
    stack({
      Component: ClassesWindow,
      props: {
        labels: _labels,
        recordId: recordId? recordId : null,
        maxAccess: access,
      },
      width: 600,
      height: 600,
      title: _labels.class
    })
  }

  const popup = obj => {
    openForm(obj?.recordId )
  }

  return (
    <>
      <Box>
        <GridToolbar onAdd={addClasses} maxAccess={access} />
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          paginationParameters={paginationParameters}
          paginationType='api'
          refetch={refetch}
          onEdit={popup}
          onDelete={delClasses}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Box>
    </>
  )
}

export default Classes
