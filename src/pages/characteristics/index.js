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
import { getNewCharGeneral, populateCharGeneral } from 'src/Models/DocumentRelease/CharacteristicsGeneral'
import { getNewCharValue, populateCharValue } from 'src/Models/DocumentRelease/CharacteristicsValues'

// ** Helpers
import { getFormattedNumberMax, validateNumberField, getNumberWithoutCommas } from 'src/lib/numberField-helper'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'

// ** Windows
import CharacteristicWindow from './Windows/CharacteristicWindow'
import ValueWindow from './Windows/ValueWindow'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'
import { isNull } from '@antfu/utils'

const Characteristics = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)
  
  //controls
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])

  const [valueGridData, setValueGridData] = useState([]) //for value tab
  const [dataTypeStore, setDataTypeStore] = useState([])
  const [currencyStore, setCurrencyStore] = useState([])

  //states
  const [activeTab, setActiveTab] = useState(0)
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const [valueWindowOpen, setValueWindowOpen] = useState(false)
  const [valueEditMode, setValueEditMode] = useState(false)

  const _labels = {
    name: labels && labels.find(item => item.key === 1).value,
    dataType: labels && labels.find(item => item.key === 2).value,
    property: labels && labels.find(item => item.key === 3).value,
    isRange: labels && labels.find(item => item.key === 4).value,
    isMultiple: labels && labels.find(item => item.key === 5).value,
    allowNeg: labels && labels.find(item => item.key === 6).value,
    caseSensitive: labels && labels.find(item => item.key === 7).value,
    currency: labels && labels.find(item => item.key === 8).value,
    textSize: labels && labels.find(item => item.key === 9).value,
    validFrom: labels && labels.find(item => item.key === 10).value,
    characteristic: labels && labels.find(item => item.key === 11).value,
    value: labels && labels.find(item => item.key === 12).value
  }

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'textSize',
      headerName: _labels.textSize,
      flex: 1,
      align: 'right',

      valueGetter: ({ row }) => getFormattedNumberMax(row?.textSize, 10, 3)
    },
    {
      field: 'validFrom',
      headerName: _labels.validFrom,
      flex: 1
    }
  ]

  const tabs = [{ label: _labels.characteristic }, { label: _labels.value, disabled: !editMode }]

  const characteristicValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      name: yup.string().required('This field is required'),
      dataType: yup.string().required('This field is required'),
      currencyName: yup.string().required('This field is required'),
      validFrom: yup.string().required('This field is required'),
      textSize: yup
        .number()
        .transform((value, originalValue) => validateNumberField(value, originalValue))
        .min(0, 'Value must be greater than or equal to 0')
        .max(2147483647, 'Value must be less than or equal to 2,147,483,647'),
    }),
    onSubmit: values => {
      console.log(values)
      values.textSize = getNumberWithoutCommas(values.textSize)
      postCharacteristic(values)
    }
  })

  const handleSubmit = () => {
    if (activeTab === 0) characteristicValidation.handleSubmit()
    
    //else if (activeTab === 1) valueValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.CharacteristicsGeneral.qry,
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

  const postCharacteristic = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: DocumentReleaseRepository.CharacteristicsGeneral.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        characteristicValidation.setFieldValue('recordId', res.recordId)
        getGridData({})
        if (!recordId) {
          toast.success('Record Added Successfully')
          setEditMode(true)
        } else toast.success('Record Edited Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delCharacteristic = obj => {
    postRequest({
      extension: DocumentReleaseRepository.CharacteristicsGeneral.del,
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

  const addCharacteristic = () => {
    characteristicValidation.setValues(getNewCharGeneral)
    resetValue()
    setValueGridData([])
    fillDataTypeStore() 
    fillCurrencyStore() 
    setEditMode(false)
    setWindowOpen(true)
    setActiveTab(0)
  }

  const editCharacteristic = obj => {
    setActiveTab(0)
    console.log(obj)
    fillDataTypeStore() 
    fillCurrencyStore()
    resetValue()
    getValueGridData(obj.recordId)
    getCharById(obj)
  }

  const getCharById = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.CharacteristicsGeneral.get,
      parameters: parameters
    })
      .then(res => {
        res.record.textSize = typeof res.record.textSize !== undefined && getFormattedNumberMax(obj?.textSize, 10, 3)
        characteristicValidation.setValues(populateCharGeneral(res.record))
        setEditMode(true)
        setWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillDataTypeStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.DR_CHA_DATA_TYPE,
      callback: setDataTypeStore
    })
  }

   const fillCurrencyStore = () => {
    var parameters = '_filter='
    getRequest({
      extension: SystemRepository.Currency.qry,
      parameters: parameters
    })
      .then(res => {
        setCurrencyStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  } 

  useEffect(() => {
    if (!access) getAccess(ResourceIds.Characteristics, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 50 })
        getLabels(ResourceIds.Characteristics, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  // Value Tab

  const valueValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      value: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postValue(values)
    }
  })

  const postValue = obj => {
    const recordId = obj.recordId
    const chId = obj.chId ? obj.chId : characteristicValidation.values.chId
    postRequest({
      extension: DocumentReleaseRepository.CharacteristicsValues.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        if (!codeId) {
          toast.success('Record Added Successfully')
        } else toast.success('Record Editted Successfully')

        setValueWindowOpen(false)
        getValueGridData(chId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const resetValue = () => {}

  const getValueGridData = chId => {
    setValueGridData([])
    const defaultParams = `_chId=${chId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.CharacteristicsValues.qry,
      parameters: parameters
    })
      .then(res => {
        setValueGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delValue = obj => {
    postRequest({
      extension: DocumentReleaseRepository.CharacteristicsValues.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Deleted Successfully')
        getValueGridData(obj.chId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addValue = () => {
    valueValidation.setValues(getNewCharValue(characteristicValidation.values.recordId))
    setValueWindowOpen(true)
  }

  const editValue = obj => {
    getValueById(obj)
  }

    const getValueById = obj => {
    const _seqNo = obj.seqNo
    const _chId = obj.chId
    const defaultParams = `_seqNo=${_seqNo}&_chId=${_chId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.CharacteristicsValues.get,
      parameters: parameters
    })
      .then(res => {
        valueValidation.setValues(populateCharValue(res.record))
        setValueEditMode(true)
        setValueWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  } 

  const handleValueSubmit = () => {
    valueValidation.handleSubmit()
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
        <GridToolbar onAdd={addCharacteristic} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editCharacteristic}
          onDelete={delCharacteristic}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <CharacteristicWindow
          onClose={() => setWindowOpen(false)}
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          width={600}
          height={400}
          onSave={handleSubmit}
          characteristicValidation={characteristicValidation}
          _labels={_labels}
          maxAccess={access}
          editMode={editMode}
          currencyStore={currencyStore}
          dataTypeStore={dataTypeStore}
          
          //Value tab (grid)
          valueGridData={valueGridData}
          getValueGridData={getValueGridData}
          addValue={addValue}
          delValue={delValue}
          editValue={editValue}
        />
      )}
      {valueWindowOpen && (
        <ValueWindow
          onClose={() => setValueWindowOpen(false)}
          onSave={handleValueSubmit}
          valueValidation={valueValidation}
          maxAccess={access}
          _labels={_labels}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default Characteristics
