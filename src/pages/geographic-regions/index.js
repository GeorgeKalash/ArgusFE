// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, Button } from '@mui/material'

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
import { getNewGeographicRegion, populateGeographicRegions } from 'src/Models/System/GeographicRegions'

// ** Windows
import GeographicRegionsWindow from './Windows/GeographicRegionsWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

const GeographicRegions = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //stores
  const [gridData, setGridData] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  const _labels = {
    reference: labels && labels.find(item => item.key === "1").value,
    name: labels && labels.find(item => item.key === "2").value,
    geographicRegion: labels && labels.find(item => item.key === "3").value
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

  const geographicRegionsValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,

    validationSchema: yup.object({
      reference: yup
        .string()
        .required('This field is required')
        .test('referenceLength', 'Field must be max 10 characters long', value => {
          return value.length < 10
        }),
      name: yup
        .string()
        .required('This field is required')
        .test('nameLength', 'Field must be max 30 characters long', value => {
          return value.length < 30
        })
    }),
    onSubmit: values => {
      postGeographicRegion(values)
    }
  })

  const handleSubmit = () => {
    geographicRegionsValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams

    getRequest({
      extension: SystemRepository.GeographicRegion.page,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postGeographicRegion = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: SystemRepository.GeographicRegion.set,
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

  const delGeographicRegion = obj => {
    postRequest({
      extension: SystemRepository.GeographicRegion.del,
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

  const addGeographicRegion = () => {
    geographicRegionsValidation.setValues(getNewGeographicRegion())
    setEditMode(false)
    setWindowOpen(true)
  }

  const editGeographicRegion = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: SystemRepository.GeographicRegion.get,
      parameters: parameters
    })
      .then(res => {
        geographicRegionsValidation.setValues(populateGeographicRegions(res.record))
        setEditMode(true)
        setWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.GeographicRegions, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 50 })
        getLabels(ResourceIds.GeographicRegions, setLabels)
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
        <GridToolbar onAdd={addGeographicRegion} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editGeographicRegion}
          onDelete={delGeographicRegion}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <GeographicRegionsWindow
          onClose={() => setWindowOpen(false)}
          width={500}
          height={300}
          onSave={handleSubmit}
          editMode={editMode}
          geographicRegionsValidation={geographicRegionsValidation}
          labels={_labels}
          maxAccess={access}
          onInfo={() => setWindowInfo(true)}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default GeographicRegions
