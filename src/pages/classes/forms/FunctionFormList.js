import { useContext, useEffect, useState } from 'react'
import { Box } from '@mui/material'
import toast from 'react-hot-toast'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import FunctionForm from '../forms/FunctionForm'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { useWindow } from 'src/windows'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ControlContext } from 'src/providers/ControlContext'

const FunctionFormList = ({ labels, store, maxAccess }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels } = useContext(ControlContext)
  const [FunctionGridData, setFunctionGridData] = useState()
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

  function openForm(functionId, editMode) {
    stack({
      Component: FunctionForm,
      props: {
        labels: labels,
        recordId: recordId,
        maxAccess: maxAccess,
        getFunctionGridData: getFunctionGridData,
        editMode: editMode,
        functionId: functionId
      },
      width: 400,
      height: 350,
      title: labels.functions
    })
  }

  const delFunction = obj => {
    postRequest({
      extension: DocumentReleaseRepository.ClassFunction.del,
      record: JSON.stringify(obj)
    }).then(res => {
      getFunctionGridData(recordId)
      toast.success(platformLabels.Deleted)
    })
  }

  const addFunction = () => {
    openForm('', false)
  }

  const editFunction = obj => {
    openForm(obj.functionId, true)
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
        setFunctionGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    recordId && getFunctionGridData(recordId)
  }, [recordId])

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={addFunction} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={FunctionGridData}
          rowId={['functionId']}
          onEdit={editFunction}
          onDelete={delFunction}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
        />
      </Grow>
    </VertLayout>
  )
}

export default FunctionFormList
