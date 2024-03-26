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
import CharacteristicsWindow from '../Windows/CharacteristicsWindow'

// ** Helpers
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { useWindow } from 'src/windows'

const CharacteristicsForm = (
 { 
  labels,
  store,
  maxAccess,
  height
}) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [CharacteristicGridData , setCharacteristicGridData] = useState()
  const { stack } = useWindow()
  const { recordId } = store

  const columns = [
    {
      field: 'chName',
      headerName: labels.characteristics,
      flex: 1
    },
    {
      field: 'value',
      headerName: labels.value,
      flex: 1
    }
  ]

  function openForm (){
    stack({
      Component: CharacteristicsWindow,
      props: {
        labels: labels,
        recordId: recordId,
        maxAccess: maxAccess,
        getCharacteristicGridData: getCharacteristicGridData
      },
      width: 400,
      height: 400,
      title: labels.characteristics
    })
  }

  const delCharacteristic = obj => {
    postRequest({
      extension: DocumentReleaseRepository.ClassCharacteristics.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getCharacteristicGridData(recordId)
        toast.success('Record Deleted Successfully')
      })
  }

  const addCharacteristic = () => {
    openForm()
  }

  const getCharacteristicGridData = classId => {
    setCharacteristicGridData([])
    const defaultParams = `_classId=${classId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.ClassCharacteristics.qry,
      parameters: parameters
    })
      .then(res => {
        setCharacteristicGridData(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(()=>{
    recordId && getCharacteristicGridData(recordId)
  },[recordId])

  return (
    <>
      <Box>
        <GridToolbar onAdd={addCharacteristic} maxAccess={maxAccess} />
        <Table
          columns={columns}
          gridData={{list : CharacteristicGridData}}
          rowId={['chId']}
          onDelete={delCharacteristic}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
          height={height-100}
        />
      </Box>
    </>
  )
}

export default CharacteristicsForm