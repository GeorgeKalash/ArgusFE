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
import { SystemRepository } from 'src/repositories/SystemRepository'

const Agent = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //stores
  const [gridData, setGridData] = useState(null)
  const [countryStore, setCountryStore] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  const _labels = {
    name: labels && labels.find(item => item.key === 1).value,
    agents: labels && labels.find(item => item.key === 2).value,
    country: labels && labels.find(item => item.key === 3).value,
    countryRef: labels && labels.find(item => item.key === 4).value,
    countryName: labels && labels.find(item => item.key === 5).value
  }

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'countryRef',
      headerName: _labels.countryRef,
      flex: 1
    },
    {
      field: 'countryName',
      headerName: _labels.countryName,
      flex: 1
    }
  ]

  const agentValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required('This field is required'),
      countryId: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postAgent(values)
    }
  })

  const handleSubmit = () => {
    agentValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams

    getRequest({
      extension: RemittanceSettingsRepository.CorrespondentAgents.page,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)
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
    fillCountryStore()
    setEditMode(false)
    setWindowOpen(true)
  }

  const editAgent = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.CorrespondentAgents.get,
      parameters: parameters
    })
      .then(res => {
        agentValidation.setValues(populateAgents(res.record))
        fillCountryStore()
        setEditMode(true)
        setWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.CorrespondentAgents, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 50 })
        fillCountryStore()
        getLabels(ResourceIds.CorrespondentAgents, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  return (
    <>
      <Box>
        <GridToolbar onAdd={addAgent} maxAccess={access} />
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
          countryStore={countryStore}
          maxAccess={access}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default Agent
