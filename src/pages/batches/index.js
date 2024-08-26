import { useEffect, useState, useContext } from 'react'
import { Grid, Box, Button } from '@mui/material'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomLookup from 'src/components/Inputs/CustomLookup'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { GeneralLedgerRepository } from 'src/repositories/GeneralLedgerRepository'
import { getNewDocumentTypes, populateDocumentTypes } from 'src/Models/System/DocumentTypes'
import { defaultParams } from 'src/lib/defaults'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { ControlContext } from 'src/providers/ControlContext'

const Batches = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)

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
  const { platformLabels } = useContext(ControlContext)

  const columns = [
    {
      field: 'reference',
      headerName: 'Batches Reference',
      flex: 1
    },
    {
      field: 'dgName',
      headerName: 'System Functions',
      flex: 1
    },
    {
      field: 'ilName',
      headerName: 'Integration Logic',
      flex: 1
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1
    },
    {
      field: 'activeStatusName',
      headerName: 'Status',
      flex: 1
    },
    {
      field: 'nraRef',
      headerName: 'Number Range',
      flex: 1
    }
  ]

  const tabs = [{ label: 'Document Types' }, { label: 'Tab Two' }]

  const documentTypesValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,

    validationSchema: yup.object({
      reference: yup.string().required(),
      name: yup.string().required(),
      dgName: yup.string().required(),
      activeStatusName: yup.string().required()
    }),
    onSubmit: async values => {
      await postDocumentType(values)
    }
  })

  const handleSubmit = () => {
    if (activeTab === 0) documentTypesValidation.handleSubmit()
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
      .catch(error => {})
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
      .catch(error => {})
  }

  const fillSysFunctionsStore = () => {
    var parameters = '_database=25'
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters
    })
      .then(res => {
        setSysFunctionsStore(res.list)
      })
      .catch(error => {})
  }

  const fillActiveStatusStore = () => {
    var parameters = '_database=11'
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters
    })
      .then(res => {
        setActiveStatusStore(res.list)
      })
      .catch(error => {})
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
      .catch(error => {})
  }

  const postDocumentType = async obj => {
    const recordId = obj.recordId
    await postRequest({
      extension: SystemRepository.DocumentType.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData()
        setWindowOpen(false)
        if (!recordId) toast.success(platformLabels.Added)
        else toast.success(platformLabels.Edited)
      })
      .catch(error => {
        console.log({ error: error })
      })
  }

  const delDocumentType = obj => {
    postRequest({
      extension: SystemRepository.DocumentType.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        console.log({ res })
        getGridData()
        toast.success(platformLabels.Deleted)
      })
      .catch(error => {
        console.log({ error: error })
      })
  }

  const addDocumentType = () => {
    documentTypesValidation.setValues(getNewDocumentTypes())
    fillIntegrationLogicStore()
    setEditMode(false)
    setWindowOpen(true)
  }

  const editDocumentType = obj => {
    documentTypesValidation.setValues(populateDocumentTypes(obj))
    fillIntegrationLogicStore()
    setEditMode(true)
    setWindowOpen(true)
  }

  useEffect(() => {
    getGridData({ _startAt: 0, _pageSize: 30 })
    fillSysFunctionsStore()
    fillActiveStatusStore()
  }, [])

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={addDocumentType} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editDocumentType}
          onDelete={delDocumentType}
          isLoading={false}
        />
      </Grow>
      {windowOpen && (
        <Window
          id='DocumentTypeWindow'
          Title='Document Types'
          onClose={() => setWindowOpen(false)}
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          width={600}
          onSave={handleSubmit}
        >
          <CustomTabPanel index={0} value={activeTab}>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <CustomTextField
                  name='reference'
                  label='Reference'
                  value={documentTypesValidation.values.reference}
                  required
                  onChange={documentTypesValidation.handleChange}
                  onClear={() => documentTypesValidation.setFieldValue('reference', '')}
                  error={documentTypesValidation.touched.reference && Boolean(documentTypesValidation.errors.reference)}
                  helperText={documentTypesValidation.touched.reference && documentTypesValidation.errors.reference}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='name'
                  label='Name'
                  value={documentTypesValidation.values.name}
                  required
                  onChange={documentTypesValidation.handleChange}
                  onClear={() => documentTypesValidation.setFieldValue('name', '')}
                  error={documentTypesValidation.touched.name && Boolean(documentTypesValidation.errors.name)}
                  helperText={documentTypesValidation.touched.name && documentTypesValidation.errors.name}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomComboBox
                  name='dgName'
                  label='System Functions'
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
                  helperText={documentTypesValidation.touched.dgName && documentTypesValidation.errors.dgName}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomComboBox
                  name='ilName'
                  label='Integration Logic'
                  valueField='recordId'
                  displayField='name'
                  store={integrationLogicStore}
                  getOptionBy={documentTypesValidation.values.ilId}
                  value={documentTypesValidation.values.ilName}
                  onChange={(event, newValue) => {
                    documentTypesValidation.setFieldValue('ilId', newValue?.recordId)
                    documentTypesValidation.setFieldValue('ilName', newValue?.name)
                  }}
                  error={documentTypesValidation.touched.ilName && Boolean(documentTypesValidation.errors.ilName)}
                  helperText={documentTypesValidation.touched.ilName && documentTypesValidation.errors.ilName}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomComboBox
                  name='activeStatusName'
                  label='Status'
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
                />
              </Grid>
              <Grid item xs={12}>
                <CustomLookup
                  name='nraRef'
                  label='Number Range'
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
                />
              </Grid>
            </Grid>
          </CustomTabPanel>
        </Window>
      )}
    </VertLayout>
  )
}

export default Batches
