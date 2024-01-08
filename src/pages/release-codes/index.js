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
import { ControlContext } from 'src/providers/ControlContext'
import { getNewReleaseCode, populateReleaseCode } from 'src/Models/DocumentRelease/ReleaseCode'


// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Windows
import ReleaseCodeWindow from './Windows/ReleaseCodeWindow'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'

const ReleaseCodes = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //controls
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false) 
  const [errorMessage, setErrorMessage] = useState(null)

  const _labels = {
    reference: labels && labels.find(item => item.key === "1").value,
    name: labels && labels.find(item => item.key === "2").value,
    releaseCode: labels && labels.find(item => item.key === "3").value
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
    }
  ]

  const releaseCodeValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      console.log(values)
      postReleaseCode(values)
    }
  })

  const handleSubmit = () => {
    releaseCodeValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.ReleaseCode.page,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)
        console.log(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postReleaseCode = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: DocumentReleaseRepository.ReleaseCode.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        setWindowOpen(false)
        if (!recordId) toast.success('Record Added Successfully')
        else toast.success('Record Edited Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delReleaseCode = obj => {
    postRequest({
      extension: DocumentReleaseRepository.ReleaseCode.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        console.log({ res })
        getGridData({})
        toast.success('Record Deleted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addReleaseCode = () => {
    releaseCodeValidation.setValues(getNewReleaseCode)
    setEditMode(false)
    setWindowOpen(true)
  }

  const editReleaseCode = obj => {
    console.log(obj)
    getReleaseCodeById(obj)
  }

  const getReleaseCodeById = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.ReleaseCode.get,
      parameters: parameters
    })
      .then(res => {      
        releaseCodeValidation.setValues(populateReleaseCode(res.record))
        setEditMode(true)
        setWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.ReleaseCodes, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 30 })
        getLabels(ResourceIds.ReleaseCodes,setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])
 
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <GridToolbar onAdd={addReleaseCode} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editReleaseCode}
          onDelete={delReleaseCode}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
       <ReleaseCodeWindow
       onClose={() => setWindowOpen(false)}
       width={600}
       height={400}
       onSave={handleSubmit}
       releaseCodeValidation={releaseCodeValidation}
       _labels ={_labels}
       maxAccess={access}
       editMode={editMode}
       />
       )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default ReleaseCodes
