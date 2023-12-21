import React, { useContext, useEffect } from 'react'
import { Box, Grid } from '@mui/material'
import GridToolbar from 'src/components/Shared/GridToolbar'
import Table from 'src/components/Shared/Table'
import { useState } from 'react'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import NumberRangeWindow from './Windows/NumberRangeWindow'
import { useFormik } from 'formik'
import { getNewNumberRange, populateNumberRange } from 'src/Models/System/NumberRange'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

const NumberRange = () => {


  const { getLabels, getAccess } = useContext(ControlContext)
  const { getRequest, postRequest } = useContext(RequestsContext)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)
  const [dateRequired, setDateRequired] = useState(null)


  //stores
  const [gridData, setGridData] = useState([])
  const [typeStore, setTypeStore] = useState([])

  //states
  const [activeTab, setActiveTab] = useState(0)
  const [windowOpen, setWindowOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    if (!access) getAccess(ResourceIds.NumberRange, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 30 })

        // fillSysFunctionsStore()
        // fillActiveStatusStore()
        getLabels(ResourceIds.NumberRange, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])



  const _labels = {
    reference: labels &&  labels.find(item => item.key === 1).value,
    description: labels  &&  labels.find(item => item.key === 2).value,
    min: labels && labels.find(item => item.key === 3).value,
    max: labels &&   labels.find(item => item.key === 4).value,
    current: labels &&   labels.find(item => item.key === 5).value,
    external: labels &&   labels.find(item => item.key === 6).value,
    dateRange: labels &&   labels.find(item => item.key === 7).value,
    startDate: labels &&   labels.find(item => item.key === 8).value,
    endDate: labels &&   labels.find(item => item.key === 9).value,
    title: labels &&   labels.find(item => item.key === 10).value

  }

  const columns = [
    {
      field: 'reference',
      headerName: _labels.reference,
      flex: 1,
      editable: false
    },
    {
      field: 'description',
      headerName: _labels.description,
      flex: 1,
      editable: false
    },
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
      editable: false,

    },
    {
      field: 'current',
      headerName: _labels.current,
      flex: 1,
      editable: false
    }
  ]

  const addNumberRange = () => {
    NumberRangeValidation.setValues(getNewNumberRange())
    setWindowOpen(true)
  }

  const delNumberRange = obj => {
    postRequest({
      extension: SystemRepository.NumberRange.del,
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

  const editNumberRange = obj => {
    console.log('test', obj)
    NumberRangeValidation.setValues(populateNumberRange(obj))
    console.log(obj)

    setWindowOpen(true)
  }

  const getGridData = ({ _startAt = 0, _pageSize = 30 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&_filter=`
    var parameters = defaultParams

    getRequest({
      extension: SystemRepository.NumberRange.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData({ ...res, _startAt })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const NumberRangeValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: windowOpen && yup.object({
      reference: yup.string().required('This field is required'),
      min: yup.string().required('This field is required'),
      max: yup.string().required('This field is required'),
      current: yup.string().required('This field is required'),
      description: yup.string().required('This field is required'),
      startDate: dateRequired && yup.string().required('This field is required'),
      endDate: dateRequired && yup.string().required('This field is required'),

    }),
    onSubmit: values => {
      console.log({ values })
      postNumberRange(values)
    }
  })

  const postNumberRange = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: SystemRepository.NumberRange.set,
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
    NumberRangeValidation.handleSubmit()
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
        <GridToolbar onAdd={addNumberRange} maxAccess={access} />

        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          isLoading={false}
          maxAccess={access}
          onEdit={editNumberRange}
          onDelete={delNumberRange}
        />
      </Box>

      {windowOpen && (
        <NumberRangeWindow
          onClose={() => setWindowOpen(false)}
          width={600}
          height={'65vh'}
          onSave={handleSubmit}
          NumberRangeValidation={NumberRangeValidation}
          labels={_labels}
          maxAccess={access}
          setRequired={setDateRequired}
        />
      )}
    </>
  )
}

export default NumberRange
