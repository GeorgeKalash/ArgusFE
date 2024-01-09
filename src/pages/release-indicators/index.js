// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { ControlContext } from 'src/providers/ControlContext'
import { CommonContext } from 'src/providers/CommonContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { getNewReleaseInd, populateReleaseInd } from 'src/Models/DocumentRelease/ReleaseIndicator'

// ** Helpers
import { validateNumberField } from 'src/lib/numberField-helper'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'

// ** Windows
import ReleaseIndicatorWindow from './Windows/ReleaseIndicatorWindow'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'

const ReleaseIndicators = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  //controls
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])
  const [changeabilityStore, setChangeabilityStore] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const _labels = {
    reference: labels && labels.find(item => item.key === "1").value,
    name: labels && labels.find(item => item.key === "2").value,
    id: labels && labels.find(item => item.key === "3").value,
    changeability: labels && labels.find(item => item.key === "4").value,
    isReleased: labels && labels.find(item => item.key === "5").value,
    releaseInd: labels && labels.find(item => item.key === "6").value
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
    {
      field: 'recordId',
      headerName: _labels.id,
      flex: 1,
      align: 'right'

      //valueGetter: ({ row }) => getFormattedNumberMax(row?.recordId, 1, 0)
    },
    {
      field: 'changeabilityName',
      headerName: _labels.changeability,
      flex: 1
    }
  ]

  const releaseIndValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      recordId: yup
        .number()
        .required('This field is required')
        .transform((value, originalValue) => validateNumberField(value, originalValue))
        .min(0, 'Value must be greater than or equal to 0')
        .max(9, 'Value must be less than or equal to 9'),
      changeability: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      console.log(values)
      postReleaseInd(values)
    }
  })

  const handleSubmit = () => {
    releaseIndValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.ReleaseIndicator.page,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)
        console.log(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postReleaseInd = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: DocumentReleaseRepository.ReleaseIndicator.set,
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

  const delReleaseInd = obj => {
    postRequest({
      extension: DocumentReleaseRepository.ReleaseIndicator.del,
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

  const addReleaseInd = () => {
    releaseIndValidation.setValues(getNewReleaseInd)
    fillChangeabilityStore()
    setEditMode(false)
    setWindowOpen(true)
  }

  const editReleaseInd = obj => {
    console.log(obj)
    fillChangeabilityStore()
    getCharById(obj)
  }

  const getCharById = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.ReleaseIndicator.get,
      parameters: parameters
    })
      .then(res => {
        releaseIndValidation.setValues(populateReleaseInd(res.record))
        setEditMode(true)
        setWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.ReleaseIndicators, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 30 })
        fillChangeabilityStore()
        getLabels(ResourceIds.ReleaseIndicators, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  const fillChangeabilityStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.DR_CHANGEABILITY,
      callback: setChangeabilityStore
    })
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
        <GridToolbar onAdd={addReleaseInd} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editReleaseInd}
          onDelete={delReleaseInd}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <ReleaseIndicatorWindow
          onClose={() => setWindowOpen(false)}
          width={600}
          height={400}
          onSave={handleSubmit}
          releaseIndValidation={releaseIndValidation}
          changeabilityStore={changeabilityStore}
          _labels={_labels}
          maxAccess={access}
          editMode={editMode}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default ReleaseIndicators
