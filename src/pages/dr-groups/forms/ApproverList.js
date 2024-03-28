// ** React Imports
import { useState, useContext } from 'react'
import { useFormik } from 'formik'
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import { useWindow } from 'src/windows'

// ** MUI Imports
import {Box } from '@mui/material'
import toast from 'react-hot-toast'
import { DocumentReleaseRepository} from 'src/repositories/DocumentReleaseRepository'
import * as yup from 'yup'

import {  useEffect } from 'react'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'

import ApproverForm from './ApproverForm'

// ** Helpers
import { useInvalidate, useResourceQuery } from 'src/hooks/resource'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'

const ApproverList = ({store,labels,maxAccess}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const {recordId}= store
  const [selectedRecordId, setSelectedRecordId] = useState(null)
  const { stack } = useWindow()
  const [valueGridData , setValueGridData] = useState()

  const [refresh,setRefresh]=useState(false)

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  // async function fetchGridData(options = {}) {
  //   const { _startAt = 0, _pageSize = 50 } = options

  //   return await getRequest({
  //     extension: DocumentReleaseRepository.GroupCode.qry,
  //     parameters: `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=&_groupId=${recordId}`
  //   })
  // }



  const getValueGridData = recordId => {
   
    getRequest({
      extension: DocumentReleaseRepository.GroupCode.qry,
      parameters: `_filter=&_groupId=${recordId}`
    })
      .then(res => {
        setValueGridData(res)
        console.log('resss',res)
      
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }
  useEffect(()=>{
    recordId && getValueGridData(recordId)
    
  },[recordId,refresh])

  // const {
  //   query: { data },
  //   labels: _labels,
  //   access
  // } = useResourceQuery({
  //   queryFn: fetchGridData,
  //   endpointId: DocumentReleaseRepository.GroupCode.qry,
  //   datasetId: ResourceIds.DRGroups
  // })



  const columns = [
    {
      field: 'codeRef',
      headerName: labels.reference,
      flex: 1
    },
  ]


  const addApprover = () => {
    openForm2()
  }



  const delApprover = async obj => {
    await postRequest({
      extension:DocumentReleaseRepository.GroupCode.del,
      record: JSON.stringify(obj)
    })
    setRefresh(prev=>!prev)
    
    toast.success('Record Deleted Successfully')
  }

  function openForm2 (recordId){
    stack({
      Component: ApproverForm,
      props: {
        labels: labels,
        recordId: recordId? recordId : null,
        maxAccess,
        store,
        setRefresh
        
      },
      width: 500,
      height: 400,
      title: labels.approver
    })
  }


  
  

  return (
  
    <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%'
    }}
  >

    <GridToolbar onAdd={addApprover} maxAccess={maxAccess} />
    <Table
      columns={columns}
      gridData={valueGridData}
      rowId={['codeId']}
      isLoading={false}
      pageSize={50}
      pagination={false}
     
      onDelete={delApprover}
      maxAccess={maxAccess}      
      height={300}
    />
  </Box>
      
  )
}

export default ApproverList


  
