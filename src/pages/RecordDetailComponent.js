import React from 'react';
import { useState, useContext } from 'react'

// ** MUI Imports
import {Box } from '@mui/material'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { SystemFunction } from 'src/resources/SystemFunction'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'

// ** Windows


// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'

const RecordDetailComponent =({ recordId }) => {
    const { getRequest, postRequest } = useContext(RequestsContext)
   
    const [selectedRecordId, setSelectedRecordId] = useState(null)
  
    //states
    const [windowOpen, setWindowOpen] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)
  
    async function fetchGridData(options = {}) {
      const { _startAt = 0, _pageSize = 50 } = options
  
      return await getRequest({
        extension: GeneralLedgerRepository.RecordDetailComponent.qry,
        parameters: `_functionId=${SystemFunction.JournalVoucher}&_recordId=${recordId}`
      })
    }
  
    const {
      query: { data },
      labels: _labels,
      access
    } = useResourceQuery({
      queryFn: fetchGridData,
      endpointId: GeneralLedgerRepository.RecordDetailComponent.qry,
      datasetId: ResourceIds.RecordDetailComponent
    })
  
    const invalidate = useInvalidate({
      endpointId: GeneralLedgerRepository.RecordDetailComponent.qry
    })
  
    const columns = [
      {
        field: 'accountName',
        headerName: _labels.reference,
        flex: 1
      },
      {
        field: 'date',
        headerName: _labels.data,
        flex: 1
      },

    ]
  
  
  
  
    const edit = obj => {
      setSelectedRecordId(obj.recordId)
      setWindowOpen(true)
    }
  
    const del = async obj => {
      await postRequest({
        extension: GeneralLedgerRepository.RecordDetailComponent.del,
        record: JSON.stringify(obj)
      })
      invalidate()
      toast.success('Record Deleted Successfully')
    }
    
  
    return (
      <>
        <Box>
          <GridToolbar maxAccess={access} />
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
      
      </>
    )
  }

export default RecordDetailComponent;