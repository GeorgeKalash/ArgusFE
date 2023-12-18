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
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { getNewIdTypes, populateIdTypes } from 'src/Models/CurrencyTradingSettings/IdTypes'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ControlContext } from 'src/providers/ControlContext'

// ** Windows
import IdTypesWindow from './Windows/IdTypesWindow'

// ** Helpers
// import { getFormattedNumber, validateNumberField, getNumberWithoutCommas } from 'src/lib/numberField-helper'
import { defaultParams } from 'src/lib/defaults'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

const IdTypes = () => {
  const { getLabels, getAccess } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])

  //states
  const [activeTab, setActiveTab] = useState(0)
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const _labels = {
    IdTypes: labels && labels.find(item => item.key === 1).value,
    name: labels && labels.find(item => item.key === 2).value,
    format: labels && labels.find(item => item.key === 3).value,
    length: labels && labels.find(item => item.key === 4).value,
    tab1: labels && labels.find(item => item.key === 5) && labels.find(item => item.key === 5).value,
    tab2: labels && labels.find(item => item.key === 6) && labels.find(item => item.key === 6).value
  }

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'format',
      headerName: _labels.format,
      flex: 1
    },
    ,
    {
      field: 'length',
      headerName: _labels.length,
      flex: 1
    }
  ]

  const tabs = [{ label: _labels.tab1 }, { label: _labels.tab2, disabled: !editMode }]

  const idTypesValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required('This field is required'),
      format: yup.string().required('This field is required'),
      length: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postIdTypes(values)
    }
  })

  const handleSubmit = () => {
    if (activeTab === 0) idTypesValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams

    getRequest({
      extension: CurrencyTradingSettingsRepository.IdTypes.page,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postIdTypes = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: CurrencyTradingSettingsRepository.IdTypes.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        setEditMode(true)
        setWindowOpen(false)
        if (!recordId) toast.success('Record Added Successfully')
        else toast.success('Record Editted Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delIdTypes = obj => {
    postRequest({
      extension: CurrencyTradingSettingsRepository.IdTypes.del,
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

  const addIdTypes = () => {
    idTypesValidation.setValues(getNewIdTypes())
    setActiveTab(0)
    setEditMode(false)
    setWindowOpen(true)
  }

  const editIdTypes = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: CurrencyTradingSettingsRepository.IdTypes.get,
      parameters: parameters
    })
      .then(res => {
        idTypesValidation.setValues(populateIdTypes(res.record))
        setEditMode(true)
        setWindowOpen(true)
        setActiveTab(0)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.IdTypes, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 50 })
        getLabels(ResourceIds.IdTypes, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  return (
    <>
      <Box>
        <GridToolbar onAdd={addIdTypes} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editIdTypes}
          onDelete={delIdTypes}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <IdTypesWindow
          onClose={() => setWindowOpen(false)}
          width={600}
          height={400}
          tabs={tabs}
          onSave={handleSubmit}
          editMode={editMode}
          idTypesValidation={idTypesValidation}
          labels={_labels}
          maxAccess={access}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default IdTypes
