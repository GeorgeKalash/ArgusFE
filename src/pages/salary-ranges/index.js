import React, { useContext, useEffect } from 'react'
import { Box, Grid } from '@mui/material'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { useState } from 'react'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import SalaryRangeWindow from './Windows/SalaryRangeWindow'
import { useFormik } from 'formik'
import { getNewSalaryRange, populateSalaryRange } from 'src/Models/CurrencyTradingSettings/SalaryRange'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

const SalaryRange = () => {
  const { getLabels, getAccess } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  const [windowInfo, setWindowInfo] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])
  const [typeStore, setTypeStore] = useState([])

  //states
  const [activeTab, setActiveTab] = useState(0)
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    if (!access) getAccess(ResourceIds.SalaryRange, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 30 })

        // fillSysFunctionsStore()
        // fillActiveStatusStore()
        getLabels(ResourceIds.SalaryRange, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  const _labels = {
    min: labels && labels.find(item => item.key === '2').value,
    max: labels && labels.find(item => item.key === '3').value,
    salaryRange: labels && labels.find(item => item.key === '1').value
  }

  const columns = [
    {
      field: 'min',
      headerName: _labels.min,
      flex: 1,
      editable: false
    },
    {
      field: 'max',
      headerName: _labels.max,
      flex: 1,
      editable: false
    }
  ]

  const addSalaryRange = () => {
    salaryRangeValidation.setValues(getNewSalaryRange())
    setEditMode(false)

    // setEditMode(false)
    setWindowOpen(true)
  }

  const delSalaryRange = obj => {
    postRequest({
      extension: RemittanceSettingsRepository.SalaryRange.del,
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

  const editSalaryRange = obj => {
    salaryRangeValidation.setValues(populateSalaryRange(obj))
    
    setEditMode(true)
    setWindowOpen(true)
  }

  const getGridData = ({ _startAt = 0, _pageSize = 30 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams + '&_dgId=0'

    getRequest({
      extension: RemittanceSettingsRepository.SalaryRange.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData({ ...res, _startAt })

        setEditMode(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const salaryRangeValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      min: yup.string().required('This field is required'),
      max: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      console.log({ values })
      postSalaryRange(values)
    }
  })

  const postSalaryRange = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: RemittanceSettingsRepository.SalaryRange.set,
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

  const handleSubmit = () => {
    salaryRangeValidation.handleSubmit()
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <GridToolbar onAdd={addSalaryRange} maxAccess={access} />

        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          isLoading={false}
          maxAccess={access}
          onEdit={editSalaryRange}
          onDelete={delSalaryRange}
        />
      </Box>

      {windowOpen && (
        <SalaryRangeWindow
          onClose={() => setWindowOpen(false)}
          width={600}
          height={400}
          onSave={handleSubmit}
          salaryRangeValidation={salaryRangeValidation}
          labels={_labels}
          maxAccess={access}
          onInfo={() => setWindowInfo(true)}
          editMode={editMode}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default SalaryRange

// set edit mode on add false from api
// set edit mode on edit true
