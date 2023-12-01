// ** React Importsport
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, Button, Checkbox, FormControlLabel } from '@mui/material'

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
import { getNewInterface, populateInterface } from 'src/Models/RemittanceSettings/Interface'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ControlContext } from 'src/providers/ControlContext'

// ** Windows
import InterfaceWindow from './Windows/InterfaceWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'

const Interface = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //stores
  const [gridData, setGridData] = useState(null)

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  const _labels = {
    reference: labels && labels.find(item => item.key === 1).value,
    name: labels && labels.find(item => item.key === 2).value,
    path: labels && labels.find(item => item.key === 3).value,
    description: labels && labels.find(item => item.key === 4).value,
    interface: labels && labels.find(item => item.key === 5).value
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
    ,
    {
      field: 'path',
      headerName: _labels.path,
      flex: 1
    },
    {
      field: 'description',
      headerName: _labels.description,
      flex: 1
    }
  ]

  const interfaceValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      path: yup.string().required('This field is required'),
      description: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postInterface(values)
    }
  })

  const handleSubmit = () => {
    interfaceValidation.handleSubmit()
  }

  const getGridData = () => {
    var parameters = '_filter='
    getRequest({
      extension: RemittanceSettingsRepository.Interface.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postInterface = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: RemittanceSettingsRepository.Interface.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        setWindowOpen(false)
        if (!recordId) toast.success('Record Added Successfully')
        else toast.success('Record Editted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delInterface = obj => {
    postRequest({
      extension: RemittanceSettingsRepository.Interface.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        toast.success('Record Deleted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addInterface = () => {
    interfaceValidation.setValues(getNewInterface())
    setEditMode(false)
    setWindowOpen(true)
  }

  const editInterface = obj => {
    interfaceValidation.setValues(populateInterface(obj))
    setEditMode(true)
    setWindowOpen(true)
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.Interface, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData()
        getLabels(ResourceIds.Interface, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  return (
    <>
      <Box>
        <GridToolbar onAdd={addInterface} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editInterface}
          onDelete={delInterface}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <InterfaceWindow
          onClose={() => setWindowOpen(false)}
          width={600}
          height={400}
          onSave={handleSubmit}
          editMode={editMode}
          interfaceValidation={interfaceValidation}
          labels={_labels}
          maxAccess={access}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default Interface
