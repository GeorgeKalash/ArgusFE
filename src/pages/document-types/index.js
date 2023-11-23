// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, Button } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomLookup from 'src/components/Inputs/CustomLookup'
import GridToolbar from 'src/components/Shared/GridToolbar'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

// import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { ControlContext } from 'src/providers/ControlContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { getNewDocumentTypes, populateDocumentTypes } from 'src/Models/System/DocumentTypes'

// ** Helpers
// import { getFormattedNumber, validateNumberField, getNumberWithoutCommas } from 'src/lib/numberField-helper'
// import { defaultParams } from 'src/lib/defaults'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

const DocumentTypes = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])
  const [integrationLogicStore, setIntegrationLogicStore] = useState([])
  const [sysFunctionsStore, setSysFunctionsStore] = useState([])
  const [activeStatusStore, setActiveStatusStore] = useState([])
  const [numberRangeStore, setNumberRangeStore] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [errorMessage, setErrorMessage] = useState(null)

  const _labels = {
    reference: labels && labels.find(item => item.key === 1).value,
    name: labels && labels.find(item => item.key === 2).value,
    sysFunction: labels && labels.find(item => item.key === 3).value,
    intLogic: labels && labels.find(item => item.key === 4).value,
    status: labels && labels.find(item => item.key === 5).value,
    nuRange: labels && labels.find(item => item.key === 6).value,
    documentType: labels && labels.find(item => item.key === 7).value
  }

  const columns = [
    {
      id: 'reference',
      field: 'reference',
      headerName: _labels.reference,
      flex: 1,
      editable: false

      // align: 'right',
      // valueGetter: ({ row }) => getFormattedNumber(row?.reference, 4)
    },
    {
      id: 'dgName',
      field: 'dgName',
      headerName: _labels.sysFunction,
      flex: 1,
      editable: false
    },
    {
      id: 'ColILName',
      field: 'ilName',
      headerName: _labels.intLogic,
      flex: 1,
      editable: false
    },
    {
      id: 'name',
      field: 'name',
      headerName: _labels.name,
      flex: 1,
      editable: false
    },
    {
      id: 'activeStatusName',
      field: 'activeStatusName',
      headerName: _labels.status,
      flex: 1,
      editable: false
    },
    {
      id: 'ColNraRef',
      field: 'nraRef',
      headerName: _labels.nuRange,
      flex: 1,
      editable: false
    }
  ]

  const tabs = [{ label: _labels.documentType }, { label: 'Tab Two' }]

  const documentTypesValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,

    validationSchema: yup.object({
      // reference: yup.number()
      //     .required('This field is required')
      //     .transform((value, originalValue) => validateNumberField(value, originalValue))
      //     .min(10, 'Value must be greater than or equal to 10')
      //     .max(9999999, 'Value must be less than or equal to 9999999'),

      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required'),
      dgName: yup.string().required('This field is required'),
      activeStatusName: yup.string().required('This field is required'),
      ilId:
        access && access.record?.controls?.find(item => item.controlId === 'ilId')?.accessLevel == 2
          ? yup.string()
          : yup.string().required('This field is required')
    }),
    onSubmit: values => {
      // values.reference = getNumberWithoutCommas(values.reference)
      console.log({ values })
      postDocumentType(values)
    }
  })

  const handleSubmit = () => {
    if (activeTab === 0) documentTypesValidation.handleSubmit()
    if (activeTab === 1) gridValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 30 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams + '&_dgId=0'

    getRequest({
      extension: SystemRepository.DocumentType.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData({ ...res, _startAt })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillIntegrationLogicStore = () => {
    var parameters = ''
    getRequest({
      extension: GeneralLedgerRepository.IntegrationLogic.qry,
      parameters: parameters
    })
      .then(res => {
        setIntegrationLogicStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillSysFunctionsStore = () => {
    var parameters = '_database=25' //add 'xml'.json and get _database values from there
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters
    })
      .then(res => {
        setSysFunctionsStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillActiveStatusStore = () => {
    var parameters = '_database=11' //add 'xml'.json and get _database values from there
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters
    })
      .then(res => {
        //ask about lang values
        setActiveStatusStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const lookupNumberRange = searchQry => {
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}`
    getRequest({
      extension: SystemRepository.NumberRange.snapshot,
      parameters: parameters
    })
      .then(res => {
        setNumberRangeStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postDocumentType = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: SystemRepository.DocumentType.set,
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

  const delDocumentType = obj => {
    obj.id = '215'
    postRequest({
      extension: SystemRepository.DocumentType.del,
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

  const addDocumentType = () => {
    documentTypesValidation.resetForm()
    documentTypesValidation.setValues(getNewDocumentTypes())
    fillIntegrationLogicStore()
    setEditMode(false)
    setWindowOpen(true)
  }

  const editDocumentType = obj => {
    documentTypesValidation.resetForm()
    documentTypesValidation.setValues(populateDocumentTypes(obj))
    fillIntegrationLogicStore()
    setEditMode(true)
    setWindowOpen(true)
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.DocumentTypes, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 30 })
        fillSysFunctionsStore()
        fillActiveStatusStore()
        getLabels(ResourceIds.DocumentTypes, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  const gridValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      rows: [
        {
          name: 'test 1',
          countryRef: 'USA',
          countryName: 'United States',
          stateId: 1,
          stateName: 'State 1',
          isActive: false
        },
        {
          name: 'test 2',
          countryRef: 'USA -2',
          countryName: 'United States -2',
          stateId: 2,
          stateName: 'State 2',
          isActive: true
        }
      ]
    },
    onSubmit: values => {
      console.log({ SUBMIT: values })
    }
  })

  const mockUpStore = [
    { recordId: 0, name: 'State 0' },
    { recordId: 1, name: 'State 1' },
    { recordId: 2, name: 'State 2' }
  ]

  const countryStore = [
    { recordId: 0, countryRef: 'USA', countryName: 'United State' },
    { recordId: 1, countryRef: 'LEB', countryName: 'Lebanon' },
    { recordId: 2, countryRef: 'EGY', countryName: 'Egypt' }
  ]

  const inlineGridColumns = [
    {
      field: 'textfield',
      header: 'Name',
      name: 'name'
    },
    {
      field: 'combobox',
      header: 'Country Ref',
      nameId: 'recordId',
      name: 'countryRef',
      mandatory: true,
      store: countryStore,
      valueField: 'recordId',
      displayField: 'countryRef',
      fieldToUpdate: 'countryName'
    },
    {
      field: 'textfield',
      header: 'Country Name',
      name: 'countryName',
      mandatory: true,
      readOnly: true
    },
    {
      field: 'combobox',
      header: 'State',
      nameId: 'stateId',
      name: 'stateName',
      store: mockUpStore,
      valueField: 'recordId',
      displayField: 'name',
      mandatory: true
    },
    {
      field: 'checkbox',
      header: 'Is Active',
      name: 'isActive'
    }
  ]

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <GridToolbar onAdd={addDocumentType} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editDocumentType}
          onDelete={delDocumentType}
          isLoading={false}
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <Window
          id='DocumentTypeWindow'
          Title={_labels.documentType}
          onClose={() => setWindowOpen(false)}
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          width={800}
          height={400}
          onSave={handleSubmit}
          maxAccess={access}
          editMode={editMode}
        >
          <CustomTabPanel index={0} value={activeTab}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <CustomTextField
                  name='reference'
                  label={_labels.reference}
                  value={documentTypesValidation.values.reference}
                  required
                  onChange={documentTypesValidation.handleChange}
                  onClear={() => documentTypesValidation.setFieldValue('reference', '')}
                  error={documentTypesValidation.touched.reference && Boolean(documentTypesValidation.errors.reference)}
                  helperText={documentTypesValidation.touched.reference && documentTypesValidation.errors.reference}
                  maxAccess={access}
                  editMode={editMode}
                  maxLength={6}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='name'
                  label={_labels.name}
                  value={documentTypesValidation.values.name}
                  required
                  onChange={documentTypesValidation.handleChange}
                  onClear={() => documentTypesValidation.setFieldValue('name', '')}
                  error={documentTypesValidation.touched.name && Boolean(documentTypesValidation.errors.name)}
                  helperText={documentTypesValidation.touched.name && documentTypesValidation.errors.name}
                  maxAccess={access}
                  editMode={editMode}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomComboBox
                  name='dgName'
                  label={_labels.sysFunction}
                  valueField='key'
                  displayField='value'
                  store={sysFunctionsStore}
                  value={documentTypesValidation.values.dgName}
                  required
                  readOnly={editMode}
                  onChange={(event, newValue) => {
                    documentTypesValidation.setFieldValue('dgId', newValue?.key)
                    documentTypesValidation.setFieldValue('dgName', newValue?.value)
                  }}
                  error={documentTypesValidation.touched.dgName && Boolean(documentTypesValidation.errors.dgName)}
                  maxAccess={access}
                  editMode={editMode}
                  helperText={documentTypesValidation.touched.dgName && documentTypesValidation.errors.dgName}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomComboBox
                  name='ilId'
                  label={_labels.intLogic}
                  valueField='recordId'
                  displayField='name'
                  store={integrationLogicStore}
                  getOptionBy={documentTypesValidation.values.ilId}
                  value={integrationLogicStore.filter(item => item.recordId === documentTypesValidation.values.ilId)[0]}
                  onChange={(event, newValue) => {
                    documentTypesValidation.setFieldValue('ilId', newValue?.recordId)
                    documentTypesValidation.setFieldValue('ilName', newValue?.name)
                  }}
                  error={documentTypesValidation.touched.ilId && Boolean(documentTypesValidation.errors.ilId)}
                  helperText={documentTypesValidation.touched.ilId && documentTypesValidation.errors.ilId}
                  maxAccess={access}
                  editMode={editMode}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomComboBox
                  name='activeStatusName'
                  label={_labels.status}
                  valueField='key'
                  displayField='value'
                  store={activeStatusStore}
                  value={documentTypesValidation.values.activeStatusName}
                  required
                  onChange={(event, newValue) => {
                    documentTypesValidation.setFieldValue('activeStatus', newValue?.key)
                    documentTypesValidation.setFieldValue('activeStatusName', newValue?.value)
                  }}
                  error={
                    documentTypesValidation.touched.activeStatusName &&
                    Boolean(documentTypesValidation.errors.activeStatusName)
                  }
                  helperText={
                    documentTypesValidation.touched.activeStatusName && documentTypesValidation.errors.activeStatusName
                  }
                  maxAccess={access}
                  editMode={editMode}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomLookup
                  name='nraRef'
                  label={_labels.nuRange}
                  valueField='reference'
                  displayField='description'
                  store={numberRangeStore}
                  setStore={setNumberRangeStore}
                  firstValue={documentTypesValidation.values.nraRef}
                  secondValue={documentTypesValidation.values.nraDescription}
                  onLookup={lookupNumberRange}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      documentTypesValidation.setFieldValue('nraId', newValue?.recordId)
                      documentTypesValidation.setFieldValue('nraRef', newValue?.reference)
                      documentTypesValidation.setFieldValue('nraDescription', newValue?.description)
                    } else {
                      documentTypesValidation.setFieldValue('nraId', null)
                      documentTypesValidation.setFieldValue('nraRef', null)
                      documentTypesValidation.setFieldValue('nraDescription', null)
                    }
                  }}
                  error={documentTypesValidation.touched.nra && Boolean(documentTypesValidation.errors.nra)}
                  helperText={documentTypesValidation.touched.nra && documentTypesValidation.errors.nra}
                  maxAccess={access}
                  editMode={editMode}
                />
              </Grid>
            </Grid>
          </CustomTabPanel>
          <CustomTabPanel index={1} value={activeTab}>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
              <InlineEditGrid
                gridValidation={gridValidation}
                columns={inlineGridColumns}
                defaultRow={{
                  name: '',
                  countryRef: '',
                  countryName: '',
                  stateId: 1,
                  stateName: 'State 1',
                  isActive: false
                }}
              />
            </Box>
          </CustomTabPanel>
        </Window>
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default DocumentTypes
