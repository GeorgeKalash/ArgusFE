// ** React Importsport
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, Button, FormControlLabel } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { getNewAgents, populateAgents } from 'src/Models/RemittanceSettings/Agent'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ControlContext } from 'src/providers/ControlContext'

// ** Windows
import AgentWindow from './Windows/AgentWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'

const Agent = () => {
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
    name: labels && labels.find(item => item.key === 1).value,
    agents: labels && labels.find(item => item.key === 2).value
  }

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    }
  ]

  const agentValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      name: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postAgent(values)
    }
  })

  const handleSubmit = () => {
    agentValidation.handleSubmit()
  }

  const getGridData = () => {
    var parameters = '_filter='
    getRequest({
      extension: RemittanceSettingsRepository.CorrespondentAgents.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postAgent = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: RemittanceSettingsRepository.CorrespondentAgents.set,
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

  const delAgent = obj => {
    postRequest({
      extension: RemittanceSettingsRepository.CorrespondentAgents.del,
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

  const addAgent = () => {
    agentValidation.setValues(getNewAgents())
    setEditMode(false)
    setWindowOpen(true)
  }

  const editAgent = obj => {
    agentValidation.setValues(populateAgents(obj))
    setEditMode(true)
    setWindowOpen(true)
  }

  useEffect(() => {
     if (!access)
    getAccess(ResourceIds.CorrespondentAgents, setAccess)
  else {
    if (access.record.maxAccess > 0) {
      getGridData()
      getLabels(ResourceIds.CorrespondentAgents,setLabels)
    } else {
      setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
    }
  }
}, [access])
  
return (
    <>
      <Box>
        <GridToolbar onAdd={addAgent} maxAccess={access}/>
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editAgent}
          onDelete={delAgent}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <AgentWindow
          onClose={() => setWindowOpen(false)}
          width={600}
          height={400}
          onSave={handleSubmit}
          agentValidation={agentValidation}
          labels={_labels}
          maxAccess={access}
        />
         
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default Agent
