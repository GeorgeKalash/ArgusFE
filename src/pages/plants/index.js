// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'


// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Windows
import PlantWindow from './Windows/PlantWindow'
import { useResourceQuery } from 'src/hooks/resource'
import { useWindow } from 'src/windows'

const Plants = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [errorMessage, setErrorMessage] = useState(null)
  const [recordId, setRecordId] = useState(null)
  const [editMode, setEditMode] = useState(false)

  const { stack } = useWindow()


  async function fetchWithSearch({ qry}) {

  const response=  await getRequest({
    extension: SystemRepository.Plant.snapshot,
    parameters: `_filter=${qry}`
  })

return response

}


const {
  query: { data },
  search,
  clear,
  refetch,
  labels: _labels,
  paginationParameters,
  access
} = useResourceQuery({
  queryFn: fetchGridData,
   endpointId: SystemRepository.Plant.page,
   datasetId: ResourceIds.Plants,
   search: {
    endpointId: SystemRepository.Plant.snapshot,
    searchFn: fetchWithSearch,
  }
})


async function fetchGridData(options={}) {
  const { _startAt = 0, _pageSize = 50 } = options

  const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
  var parameters = defaultParams

   const response =  await getRequest({
    extension: SystemRepository.Plant.page,
    parameters: parameters
  })


return {...response,  _startAt: _startAt}

}

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
      field: 'costCenterName',
      headerName: _labels.costCenter,
      flex: 1
    }
  ]


  const delPlant = obj => {
    postRequest({
      extension: SystemRepository.Plant.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        console.log({ res })

        // getGridData({})
        toast.success('Record Deleted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addPlant = () => {
    setEditMode(false)
    setRecordId('')
    openForm()
  }

  const editPlant = obj => {
    setEditMode(false)
    setRecordId(obj.recordId)
    openForm(obj.recordId)
      getPlantById(obj)
  }

  const getPlantById = obj => {
    console.log('recId')
    console.log(obj.recordId)
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: SystemRepository.Plant.get,
      parameters: parameters
    })
      .then(res => {
        setEditMode(true)
        setWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }


  function openForm (recordId){
    stack({
      Component: PlantWindow,
      props: {
        labels: _labels,
        recordId: recordId? recordId : null,
        editMode: editMode
      },

      width: 1000,
      height: 600,
      title: "Plant"
    })
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <GridToolbar onAdd={addPlant} maxAccess={access}  onSearch={search} onSearchClear={clear} labels={_labels}  inputSearch={true}/>
        <Table
          columns={columns}
          gridData={data}
          rowId={['recordId']}
          onEdit={editPlant}
          onDelete={delPlant}
          refetch={refetch}
          paginationType='api'
          paginationParameters={paginationParameters}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Box>

      {/* <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} /> */}
    </>
  )
}

export default Plants
