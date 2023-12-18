// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import GridToolbar from 'src/components/Shared/GridToolbar'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import Window from 'src/components/Shared/Window'
import ReportParameterBrowser from 'src/components/Shared/ReportParameterBrowser'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { ControlContext } from 'src/providers/ControlContext'
import { CommonContext } from 'src/providers/CommonContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { getNewDocumentTypeMaps, populateDocumentTypeMaps } from 'src/Models/System/DocumentTypeMaps'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

const DocumentTypeMaps = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { fillDocumentTypeStore } = useContext(CommonContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])
  const [functionStore, setFunctionStore] = useState([])
  const [fromDocumentTypeStore, setFromDocumentTypeStore] = useState([])
  const [toDocumentTypeStore, setToDocumentTypeStore] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [paramsArray, setParamsArray] = useState([])
  const [reportParamWindowOpen, setReportParamWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [errorMessage, setErrorMessage] = useState(null)

  const columns = [
    {
      field: 'fromFunctionName',
      headerName: 'From Function',
      flex: 1
    },
    {
      field: 'fromDTName',
      headerName: 'From Document',
      flex: 1
    },
    {
      field: 'toFunctionName',
      headerName: 'To Function',
      flex: 1
    },
    {
      field: 'toDTName',
      headerName: 'To Document',
      flex: 1
    }
  ]

  const documentTypeMapsValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,

    validationSchema: yup.object({
      fromFunctionId: yup.string().required('This field is required'),
      fromDTId: yup.string().required('This field is required'),
      toFunctionId: yup.string().required('This field is required'),
      dtId: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postDocumentTypeMap(values)
    }
  })

  const handleSubmit = () => {
    if (activeTab === 0) documentTypeMapsValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 30, params = '' }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams + '&_params=' + params

    getRequest({
      extension: SystemRepository.DocumentTypeMap.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData({ ...res, _startAt })
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const fillFunctionStore = () => {
    var parameters = '_database=25'
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters
    })
      .then(res => {
        setFunctionStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const postDocumentTypeMap = obj => {
    // const recordId = obj.recordId
    postRequest({
      extension: SystemRepository.DocumentTypeMap.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        setWindowOpen(false)
        if (!editMode) toast.success('Record Added Successfully')
        else toast.success('Record Editted Successfully')
      })
      .catch(error => {
        setErrorMessage(error.response.data.error)
      })
  }

  const delDocumentTypeMap = obj => {
    obj.id = '215' //check this
    postRequest({
      extension: SystemRepository.DocumentTypeMap.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        toast.success('Record Deleted Successfully')
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const addDocumentType = () => {
    documentTypeMapsValidation.setValues(getNewDocumentTypeMaps())
    setEditMode(false)
    setWindowOpen(true)
  }

  const editDocumentType = obj => {
    documentTypeMapsValidation.setValues(populateDocumentTypeMaps(obj))
    setEditMode(true)
    setWindowOpen(true)
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.DocumentTypeMaps, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 30, params: '' })
        fillFunctionStore()
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [])

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <GridToolbar
          onAdd={addDocumentType}
          maxAccess={access}
          openRPB={() => setReportParamWindowOpen(true)}
          onGo={getGridData}
          paramsArray={paramsArray}
        />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['fromFunctionId', 'fromDTId', 'toFunctionId', 'dtId']}
          api={getGridData}
          onEdit={editDocumentType}
          onDelete={delDocumentTypeMap}
          isLoading={false}
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <Window
          id='DocumentTypeWindow'
          Title='Document Type Map'
          onClose={() => setWindowOpen(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          width={600}
          height={400}
          onSave={handleSubmit}
          maxAccess={access}
          editMode={editMode}
        >
          <Grid container spacing={4} sx={{ px: 4 }}>
            <Grid item xs={12}>
              <CustomComboBox
                name='fromFunctionId'
                label='From Function'
                valueField='key'
                displayField='value'
                store={functionStore}
                value={documentTypeMapsValidation.values?.fromFunctionName}
                required
                onChange={(event, newValue) => {
                  documentTypeMapsValidation.setFieldValue('fromFunctionId', newValue?.key)
                  documentTypeMapsValidation.setFieldValue('fromFunctionName', newValue?.value)
                  fillDocumentTypeStore({
                    _startAt: 0,
                    _pageSize: 30,
                    _dgId: newValue?.key,
                    callback: setFromDocumentTypeStore
                  })
                }}
                error={
                  documentTypeMapsValidation.touched.fromFunctionId &&
                  Boolean(documentTypeMapsValidation.errors.fromFunctionId)
                }
                helperText={
                  documentTypeMapsValidation.touched.fromFunctionId && documentTypeMapsValidation.errors.fromFunctionId
                }
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomComboBox
                name='fromDTId'
                label='From Document Type'
                valueField='recordId'
                displayField='name'
                store={fromDocumentTypeStore}
                getOptionBy={documentTypeMapsValidation.values?.fromDTId}
                value={documentTypeMapsValidation.values?.fromDTName}
                onChange={(event, newValue) => {
                  documentTypeMapsValidation.setFieldValue('fromDTId', newValue?.recordId)
                  documentTypeMapsValidation.setFieldValue('fromDTName', newValue?.name)
                }}
                error={
                  documentTypeMapsValidation.touched.fromDTId && Boolean(documentTypeMapsValidation.errors.fromDTId)
                }
                helperText={documentTypeMapsValidation.touched.fromDTId && documentTypeMapsValidation.errors.fromDTId}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomComboBox
                name='toFunctionId'
                label='To Function'
                valueField='key'
                displayField='value'
                store={functionStore}
                value={documentTypeMapsValidation.values?.toFunctionName}
                required
                onChange={(event, newValue) => {
                  documentTypeMapsValidation.setFieldValue('toFunctionId', newValue?.key)
                  documentTypeMapsValidation.setFieldValue('toFunctionName', newValue?.value)
                  fillDocumentTypeStore({
                    _startAt: 0,
                    _pageSize: 30,
                    _dgId: newValue?.key,
                    callback: setToDocumentTypeStore
                  })
                }}
                error={
                  documentTypeMapsValidation.touched.toFunctionId &&
                  Boolean(documentTypeMapsValidation.errors.toFunctionId)
                }
                helperText={
                  documentTypeMapsValidation.touched.toFunctionId && documentTypeMapsValidation.errors.toFunctionId
                }
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomComboBox
                name='dtId'
                label='To Document Type'
                valueField='recordId'
                displayField='name'
                store={toDocumentTypeStore}
                getOptionBy={documentTypeMapsValidation.values?.dtId}
                value={documentTypeMapsValidation.values?.toDTName}
                onChange={(event, newValue) => {
                  documentTypeMapsValidation.setFieldValue('dtId', newValue?.recordId)
                  documentTypeMapsValidation.setFieldValue('toDTName', newValue?.name)
                }}
                error={documentTypeMapsValidation.touched.dtId && Boolean(documentTypeMapsValidation.errors.dtId)}
                helperText={documentTypeMapsValidation.touched.dtId && documentTypeMapsValidation.errors.dtId}
                maxAccess={access}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='useSameReference'
                    checked={documentTypeMapsValidation.values?.useSameReference}
                    onChange={documentTypeMapsValidation.handleChange}
                  />
                }
                label='Use Same Reference'
              />
            </Grid>
          </Grid>
        </Window>
      )}
      <ReportParameterBrowser
        reportName='SYDTM'
        open={reportParamWindowOpen}
        onClose={() => setReportParamWindowOpen(false)}
        paramsArray={paramsArray}
        setParamsArray={setParamsArray}
      />
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default DocumentTypeMaps
