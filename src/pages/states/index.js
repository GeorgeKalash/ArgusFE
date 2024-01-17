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

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { getNewState, populateState } from 'src/Models/System/States'

// ** Windows
import StatesWindow from './Windows/StatesWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

const States = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //stores
  const [gridData, setGridData] = useState([])
  const [countryStore, setCountryStore] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  const _labels = {
    states: labels && labels.find(item => item.key === "1").value,
    name: labels && labels.find(item => item.key === "2").value,
    country: labels && labels.find(item => item.key === "3").value
  }

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'countryName',
      headerName: _labels.country,
      flex: 1
    }
  ]

  const statesValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      countryId: yup.string().required('This field is required'),
      name: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postStates(values)
    }
  })

  const handleSubmit = () => {
    statesValidation.handleSubmit()
  }

  const getGridData = () => {
    const defaultParams = `_countryId=0&_startAt=0&_pageSize=50&filter=`
    var parameters = defaultParams

    getRequest({
      extension: SystemRepository.State.page,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postStates = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: SystemRepository.State.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData()
        setWindowOpen(false)
        if (!recordId) toast.success('Record Added Successfully')
        else toast.success('Record Edited Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delState = obj => {
    postRequest({
      extension: SystemRepository.State.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData()
        toast.success('Record Deleted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addState = () => {
    statesValidation.setValues(getNewState())
    fillCountryStore()
    setEditMode(false)
    setWindowOpen(true)
  }

  const editState = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: SystemRepository.State.get,
      parameters: parameters
    })
      .then(res => {
        statesValidation.setValues(populateState(res.record))
        fillCountryStore()
        setEditMode(true)
        setWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillCountryStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Country.qry,
      parameters: parameters
    })
      .then(res => {
        setCountryStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.States, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData()
        getLabels(ResourceIds.States, setLabels)
        fillCountryStore()
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <GridToolbar onAdd={addState} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editState}
          onDelete={delState}
          isLoading={false}
          paginationType='client'
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <StatesWindow
          onClose={() => setWindowOpen(false)}
          width={500}
          height={300}
          onSave={handleSubmit}
          statesValidation={statesValidation}
          labels={_labels}
          maxAccess={access}
          countryStore={countryStore}
          editMode={editMode}
          onInfo={() => setWindowInfo(true)}

        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default States
