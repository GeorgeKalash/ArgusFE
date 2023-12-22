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
import { SystemRepository } from 'src/repositories/SystemRepository'
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
  const [idtId, setidtId] = useState(null)
  const [accessLevelStore, setaccesLevelStore] = useState([])
  const [categoryStore, setCategoryStore] = useState([])

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
    tab2: labels && labels.find(item => item.key === 6) && labels.find(item => item.key === 6).value,
    control: labels && labels.find(item => item.key === 7) && labels.find(item => item.key === 7).value,
    accessLevel: labels && labels.find(item => item.key === 8) && labels.find(item => item.key === 8).value,
    category: labels && labels.find(item => item.key === 9).value
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
      length: yup.string().required('This field is required'),
      category: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postIdTypes(values)
    }
  })

  // IDFields TAB(2nd tab)
  const idFieldsValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validate: values => {
      const isValid = values.rows.every(row => !!row.accessLevel)

      return isValid ? {} : { rows: Array(values.rows.length).fill({ accessLevel: 'Access Level is required' }) }
    },
    initialValues: {
      rows: [
        {
          idtId: idTypesValidation.values
            ? idTypesValidation.values.recordId
              ? idTypesValidation.values.recordId
              : ''
            : '',
          controlId: '',
          accessLevel: '',
          accessLevelName: ''
        }
      ]
    },
    onSubmit: values => {
      postIdFields(values.rows)
    }
  })

  const idFieldsGridColumn = [
    {
      field: 'textfield',
      header: _labels.control,
      name: 'controlId',
      mandatory: true
    },
    {
      field: 'combobox',
      header: _labels.accessLevel,
      nameId: 'accessLevel',
      name: 'accessLevelName',
      mandatory: true,
      store: accessLevelStore,
      valueField: 'key',
      displayField: 'value',
      columnsInDropDown: [{ key: 'value', value: 'Value' }]
    }
  ]

  const postIdFields = obj => {
    console.log('recordId ' + idTypesValidation.values.recordId)
    console.log('items ' + JSON.stringify(obj))

    const data = {
      idtId: idTypesValidation.values.recordId,
      items: obj
    }

    postRequest({
      extension: CurrencyTradingSettingsRepository.IdFields.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        getGridData({})

        // setWindowOpen(false)
        if (!res.recordId) {
          toast.success('Record Added Successfully')
        } else {
          toast.success('Record Edited Successfully')
        }
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const getIdFields = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_idtId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: CurrencyTradingSettingsRepository.IdFields.qry,
      parameters: parameters
    })
      .then(res => {
        if (res.list.length > 0) {
          idFieldsValidation.setValues({ rows: res.list })
        } else {
          idFieldsValidation.setValues({
            rows: [
              {
                idtId: _recordId,
                controlId: '',
                accessLevel: '',
                accessLevelName: ''
              }
            ]
          })
        }
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const handleSubmit = () => {
    if (activeTab === 0) idTypesValidation.handleSubmit()
    else if (activeTab === 1) idFieldsValidation.handleSubmit()
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

  const resetIdFields = id => {
    idFieldsValidation.resetForm()
    idFieldsValidation.setValues({
      rows: [
        {
          idtId: id ? id : idTypesValidation.values ? idTypesValidation.values.recordId : '',
          controlId: '',
          accessLevel: '',
          accessLevelName: ''
        }
      ]
    })
  }

  const fillAccessLevelStore = () => {
    var parameters = '_database=3' //add 'xml'.json and get _database values from there
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters
    })
      .then(res => {
        //ask about lang values
        setaccesLevelStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const fillCategoryStore = () => {
    var parameters = '_database=147' //add 'xml'.json and get _database values from there
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters
    })
      .then(res => {
        //ask about lang values
        setCategoryStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
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
        if (!recordId) {
          idTypesValidation.setFieldValue('recordId', res.recordId)
          resetIdFields(res.recordId)
          fillAccessLevelStore()
          toast.success('Record Added Successfully')
        } else toast.success('Record Editted Successfully')
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
    resetIdFields()
    console.log(idFieldsValidation.values)
    setidtId(null)
    fillAccessLevelStore()
    fillCategoryStore()
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
        resetIdFields(obj.recordId)
        setidtId(obj.recordId)
        idTypesValidation.setValues(populateIdTypes(res.record))
        fillAccessLevelStore()
        fillCategoryStore()
        getIdFields(obj)
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
        fillAccessLevelStore()
        fillCategoryStore()
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
          idFieldsValidation={idFieldsValidation}
          labels={_labels}
          maxAccess={access}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          idtId={idtId}
          idFieldsGridColumn={idFieldsGridColumn}
          categoryStore={categoryStore}
          accessLevelStore={accessLevelStore.list}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default IdTypes
