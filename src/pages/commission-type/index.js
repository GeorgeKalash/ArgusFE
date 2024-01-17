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
import { getNewCommissionType, populateCommissionType } from 'src/Models/CurrencyTradingSettings/CommissionType'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'
import { ControlContext } from 'src/providers/ControlContext'

// ** Windows
import CommissionTypeWindow from './Windows/CommissionTypeWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'

const CommissionType = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)
  const [windowInfo, setWindowInfo] = useState(null)

  //stores
  const [gridData, setGridData] = useState(null)
  const [typeStore, setTypeStore] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  const _labels = {
    reference: labels && labels.find(item => item.key === '1').value,
    name: labels && labels.find(item => item.key === '2').value,
    type: labels && labels.find(item => item.key === '3').value,
    comissiontype: labels && labels.find(item => item.key === '4').value
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
      field: 'typeName',
      headerName: _labels.type,
      flex: 1
    }
  ]

  const commissiontypeValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      type: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postCommissionType(values)
    }
  })

  const handleSubmit = () => {
    commissiontypeValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams

    getRequest({
      extension: CurrencyTradingSettingsRepository.CommissionType.page,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillTypeStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.CT_COMMISSION_TYPES,
      callback: setTypeStore
    })
  }

  const postCommissionType = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: CurrencyTradingSettingsRepository.CommissionType.set,
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

  const delCommissionType = obj => {
    postRequest({
      extension: CurrencyTradingSettingsRepository.CommissionType.del,
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

  const addCommissionType = () => {
    commissiontypeValidation.setValues(getNewCommissionType())
    fillTypeStore()
    setEditMode(false)
    setWindowOpen(true)
  }

  const editCommissionType = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: CurrencyTradingSettingsRepository.CommissionType.get,
      parameters: parameters
    })
      .then(res => {
        commissiontypeValidation.setValues(populateCommissionType(res.record))
        fillTypeStore()
        setEditMode(true)
        setWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.CommissionType, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 50 })
        fillTypeStore()
        getLabels(ResourceIds.CommissionType, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  return (
    <>
      <Box>
        <GridToolbar onAdd={addCommissionType} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editCommissionType}
          onDelete={delCommissionType}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          paginationType='client'
        />
      </Box>
      {windowOpen && (
        <CommissionTypeWindow
          onClose={() => setWindowOpen(false)}
          width={600}
          height={400}
          onSave={handleSubmit}
          editMode={editMode}
          commissiontypeValidation={commissiontypeValidation}
          typeStore={typeStore}
          labels={_labels}
          maxAccess={access}
          onInfo={() => setWindowInfo(true)}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default CommissionType
