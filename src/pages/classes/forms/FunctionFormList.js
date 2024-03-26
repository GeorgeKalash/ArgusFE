// ** React Importsport
import { useContext, useEffect, useState } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Third Party Imports
import toast from 'react-hot-toast'

// ** Custom Imports
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'

// ** Windows
import FunctionWindow from '../Windows/FunctionWindow'

// ** Helpers
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { useWindow } from 'src/windows'

const FunctionForm = (
 { 
  labels,
  store,
  maxAccess,
  height
}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [FunctionGridData , setFunctionGridData] = useState()
  const { stack } = useWindow()
  const { recordId } = store

  const columns = [
    {
      field: 'functionName',
      headerName: labels.function,
      flex: 1
    },
    {
      field: 'strategyName',
      headerName: labels.strategy,
      flex: 1
    }
  ]

  function openForm (functionId, editMode){
    stack({
      Component: FunctionWindow,
      props: {
        labels: labels,
        recordId: recordId,
        functionId:functionId,
        maxAccess: maxAccess,
        getFunctionGridData: getFunctionGridData,
        editMode: editMode
      },
      width: 400,
      height: 400,
      title: labels.functions
    })
  }

  const delFunction = obj => {
    postRequest({
      extension: DocumentReleaseRepository.ClassFunction.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getFunctionGridData(recordId)
        toast.success('Record Deleted Successfully')
      })
  }

  const addFunction = () => {
    openForm('', false)
  }

  const editFunction = obj => {
    openForm(obj?.functionId, true)
  }

  const getFunctionGridData = classId => {
    setFunctionGridData([])
    const defaultParams = `_classId=${classId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.ClassFunction.qry,
      parameters: parameters
    })
      .then(res => {
        setFunctionGridData(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(()=>{
    recordId && getFunctionGridData(recordId)
  },[recordId])

  return (
    <>
      <Box>
        <GridToolbar onAdd={addFunction} maxAccess={maxAccess} />
        <Table
          columns={columns}
          gridData={{list : FunctionGridData}}
          rowId={['functionId']}
          onEdit={editFunction}
          onDelete={delFunction}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
          height={height-100}
        />
      </Box>
    </>
  )
}

export default FunctionForm