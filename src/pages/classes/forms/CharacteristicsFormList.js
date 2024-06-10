import { useContext, useEffect, useState } from 'react'
import { Box } from '@mui/material'
import toast from 'react-hot-toast'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import CharacteristicForm from '../forms/CharacteristicForm'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { useWindow } from 'src/windows'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

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
      Component: CharacteristicForm,
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
        setCharacteristicGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(()=>{
    recordId && getCharacteristicGridData(recordId)
  },[recordId])

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={addCharacteristic} maxAccess={maxAccess} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={CharacteristicGridData}
          rowId={['chId']}
          onDelete={delCharacteristic}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
          height={height-100}
        />
      </Grow>
    </VertLayout>
  )
}

export default CharacteristicsForm