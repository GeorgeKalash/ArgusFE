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
import { CommonContext } from 'src/providers/CommonContext'
import { getNewSourceOfIncome, populateSourceOfIncome } from 'src/Models/CurrencyTradingSettings/SourceOfIncome'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'
import { ControlContext } from 'src/providers/ControlContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'

// ** Windows
import SourceOfIncomeWindow from './Windows/SourceOfIncomeWindow'

// ** Helpers
// import { getFormattedNumber, validateNumberField, getNumberWithoutCommas } from 'src/lib/numberField-helper'
import { defaultParams } from 'src/lib/defaults'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

const SourceOfIncome = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

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
    reference: labels && labels.find(item => item.key === "1").value,
    name: labels && labels.find(item => item.key === "2").value,
    foreignLanguage: labels && labels.find(item => item.key === "3").value,
    incomeType: labels && labels.find(item => item.key === "4").value,
    sourceOfIncome: labels && labels.find(item => item.key === "5").value
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
    getAllKvsByDataset({
      _dataset: DataSets.CT_INCOME_TYPE,
      callback: setIncomeTypeStore
    })
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams

    getRequest({
      extension: RemittanceSettingsRepository.SourceOfIncome.page,
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
      extension: RemittanceSettingsRepository.SourceOfIncome.set,
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
      extension: RemittanceSettingsRepository.SourceOfIncome.del,
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
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.SourceOfIncome.get,
      parameters: parameters
    })
      .then(res => {
        sourceOfIncomeValidation.resetForm()
        sourceOfIncomeValidation.setValues(populateSourceOfIncome(res.record))
        fillIncomeStore()
        setEditMode(true)
        setWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.SourceOfIncome, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 50 })
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
