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
      
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }
  useEffect(()=>{
    recordId && getValueGridData(recordId)
  },[recordId])

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

  const editApprover = obj => {
    openForm2()
  }

  const delApprover = async obj => {
    await postRequest({
      extension:DocumentReleaseRepository.GroupCode.del,
      record: JSON.stringify(obj)
    })
    
    toast.success('Record Deleted Successfully')
  }

  function openForm2 (recordId){
    stack({
      Component: ApproverForm,
      props: {
        labels: labels,
        recordId: recordId? recordId : null,
        maxAccess,
        store
      },
      width: 300,
      height: 300,
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
      paginationType='client'
      onEdit={editApprover}
      onDelete={delApprover}
      maxAccess={maxAccess}      
      height={300}
    />
  </Box>
      
  )
}

export default ApproverList


  

//   </>
//   );
// };





// const ApproverTab = ({ approverGridData, getApproverGridData, addApprover, delApprover, editApprover, maxAccess, _labels }) => {}
// const ValuesForm = (
//   {
//    labels,
//    store,
//    maxAccess,
//    height
//  }) => {
//    const { getRequest, postRequest } = useContext(RequestsContext)
//    const [maxSeqNo, setMaxSeqNo] = useState(0);
//    const [valueGridData , setValueGridData] = useState()
//    const { stack } = useWindow()
//    const { recordId } = store
//    const columns = [
//      {
//        field: 'value',
//        headerName: labels.value,
//        flex: 1
//      }
//    ]
//    function openForm (recordId , seqNo, edit){
//      stack({
//        Component: ValuesWindow,
//        props: {
//          labels: labels,
//          chId: store.recordId ,
//          recordId: recordId,
//          seqNo: seqNo,
//          maxAccess: maxAccess,
//          getValueGridData: getValueGridData,
//          edit: edit
//        },
//        width: 400,
//        height: 400,
//        title: labels.values
//      })
//    }
//    const delValue = obj => {
//      postRequest({
//        extension: DocumentReleaseRepository.CharacteristicsValues.del,
//        record: JSON.stringify(obj)
//      })
//        .then(res => {
//          getValueGridData(recordId)
//          toast.success('Record Deleted Successfully')
//        })
//    }
//    const addValue = () => {
//      openForm('', maxSeqNo + 1, false)
//    }
//    const editValue = obj => {
//      openForm(obj?.chId , obj?.seqNo, true)
//    }

//        .then(res => {
//          setValueGridData(res.list)
//          const maxSeq = Math.max(...res.list.map(item => item.seqNo), 0)
//          setMaxSeqNo(maxSeq)
//        })
//        .catch(error => {
//          setErrorMessage(error)
//        })
//    }
//    useEffect(()=>{
//      recordId && getValueGridData(recordId)
//    },[recordId])
//    return (
//      <>
//        <Box>
//          <GridToolbar onAdd={addValue} maxAccess={maxAccess} />
//          <Table
//            columns={columns}
//            gridData={{list : valueGridData}}
//            rowId={['seqNo']}
//            onEdit={editValue}
//            onDelete={delValue}
//            isLoading={false}
//            maxAccess={maxAccess}
//            pagination={false}
//            height={height-100}
//          />
//        </Box>
//      </>
//    )
//  }
