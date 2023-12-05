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
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { getNewSourceOfIncome, populateSourceOfIncome } from 'src/Models/CurrencyTradingSettings/SourceOfIncome'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ControlContext } from 'src/providers/ControlContext'

// ** Windows
import SourceOfIncomeWindow from './Windows/SourceOfIncomeWindow'

// ** Helpers
// import { getFormattedNumber, validateNumberField, getNumberWithoutCommas } from 'src/lib/numberField-helper'
import { defaultParams } from 'src/lib/defaults'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

const SourceOfIncome = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //stores
  const [gridData, setGridData] = useState(null)
  const [incomeTypeStore, setIncomeTypeStore] = useState([])

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
    foreignLanguage: labels && labels.find(item => item.key === 3).value,
    incomeType: labels && labels.find(item => item.key === 4).value,
    sourceOfIncome: labels && labels.find(item => item.key === 5).value
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
      field: 'flName',
      headerName: _labels.foreignLanguage,
      flex: 1
    },
    {
      field: 'incomeTypeName',
      headerName: _labels.incomeType,
      flex: 1
    }
  ]

  const sourceOfIncomeValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      flName: yup.string().required('This field is required'),
      incomeType: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postSourceOfIncome(values)
    }
  })

  const handleSubmit = () => {
    sourceOfIncomeValidation.handleSubmit()
  }

  const fillIncomeStore = () => {
    var parameters = '_database=3502' //add 'xml'.json and get _database values from there
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters
    })
      .then(res => {
        setIncomeTypeStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const getGridData = () => {
    var parameters = '_filter='
    getRequest({
      extension: CurrencyTradingSettingsRepository.SourceOfIncome.page,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postSourceOfIncome = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: CurrencyTradingSettingsRepository.SourceOfIncome.set,
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

  const delSourceOfIncome = obj => {
    postRequest({
      extension: CurrencyTradingSettingsRepository.SourceOfIncome.del,
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

  const addSourceOfIncome = () => {
    sourceOfIncomeValidation.resetForm()
    sourceOfIncomeValidation.setValues(getNewSourceOfIncome())
    fillIncomeStore()
    setEditMode(false)
    setWindowOpen(true)
  }

  const editSourceOfIncome = obj => {
    sourceOfIncomeValidation.resetForm()
    sourceOfIncomeValidation.setValues(populateSourceOfIncome(obj))
    fillIncomeStore()
    setEditMode(true)
    setWindowOpen(true)
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.SourceOfIncome, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData()
        fillIncomeStore()
        getLabels(ResourceIds.SourceOfIncome, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  return (
    <>
      <Box>
        <GridToolbar onAdd={addSourceOfIncome} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editSourceOfIncome}
          onDelete={delSourceOfIncome}
          isLoading={false}
          pageSize={50}
          paginationType='client'
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <SourceOfIncomeWindow
          onClose={() => setWindowOpen(false)}
          width={600}
          height={400}
          onSave={handleSubmit}
          sourceOfIncomeValidation={sourceOfIncomeValidation}
          incomeTypeStore={incomeTypeStore}
          labels={_labels}
          maxAccess={access}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default SourceOfIncome
