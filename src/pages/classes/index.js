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
import { getNewClass, populateClass } from 'src/Models/DocumentRelease/Class'
import { getNewClassCharacteristics, populateClassCharacteristics } from 'src/Models/DocumentRelease/ClassCharacteristics'
import { getNewClassFunction, populateClassFunction } from 'src/Models/DocumentRelease/ClassFunction'


// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'

// ** Windows
import ClassWindow from './Windows/ClassWindow'
import CharacteristicWindow from './Windows/CharacteristicWindow'
import FunctionWindow from './Windows/FunctionWindow'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'

const Classes = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  //controls
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])
  const [charOperatorComboStore, setCharOperatorComboStore] = useState([])

  const [characteristicGridData, setCharacteristicGridData] = useState([]) //for characteristic tab
  const [characteristicComboStore, setCharacteristicComboStore] = useState([]) //combo in characteristic window
  const [characValueComboStore, setCharacValueComboStore] = useState(null) //value combo in characteristic window

  const [functionGridData, setFunctionGridData] = useState([]) //for funxtion tab
  const [functionComboStore, setFunctionComboStore] = useState([]) //combo in function window
  const [functionStrategyComboStore, setFunctionStrategyComboStore] = useState([]) //strategy combo in function window

  //states
  const [activeTab, setActiveTab] = useState(0)
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const [characteristicWindowOpen, setCharacteristicWindowOpen] = useState(false)
  const [characteristicEditMode, setCharacteristicEditMode] = useState(false)

  const [functionWindowOpen, setFunctionWindowOpen] = useState(false)
  const [functionEditMode, setFunctionEditMode] = useState(false)

  const _labels = {   
    classes: labels && labels.find(item => item.key === "1").value, 
    class: labels && labels.find(item => item.key === "2").value,
    name: labels && labels.find(item => item.key === "3").value,
    charOperator: labels && labels.find(item => item.key === "4").value,
    characteristics: labels && labels.find(item => item.key === "5").value,
    characteristic: labels && labels.find(item => item.key === "6").value,
    value: labels && labels.find(item => item.key === "7").value,
    functions: labels && labels.find(item => item.key === "8").value,
    function: labels && labels.find(item => item.key === "9").value,
    strategy: labels && labels.find(item => item.key === "10").value
  }

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    }
  ]

  const tabs = [{ label: _labels.class }, { label: _labels.characteristics, disabled: !editMode }, { label: _labels.functions, disabled: !editMode }]

  const classValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      name: yup.string().required('This field is required'),
      characteristicOperator: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postClass(values)
    }
  })

  const handleSubmit = () => {
    if (activeTab === 0) classValidation.handleSubmit()

    //else if (activeTab === 1) characteristicValidation.handleSubmit() (grid with window to save)
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.Class.page,
      parameters: parameters
    })
      .then(res => {
        setGridData({ ...res, _startAt })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postClass = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: DocumentReleaseRepository.Class.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        classValidation.setFieldValue('recordId', res.recordId)
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

  const delClass = obj => {
    postRequest({
      extension: DocumentReleaseRepository.Class.del,
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

  const addClass = () => {
    classValidation.setValues(getNewClass)
    setCharacteristicGridData([])
    setFunctionGridData([])
    fillCharOperatorComboStore()
    setEditMode(false)
    setWindowOpen(true)
    setActiveTab(0)
  }

  const fillCharOperatorComboStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.CHAR_OPERATOR,
      callback: setCharOperatorComboStore
    })
  }


  const editClass = obj => {
    setActiveTab(0)
    fillCharOperatorComboStore()
    getCharacteristicGridData(obj.recordId)
    getFunctionGridData(obj.recordId)
    getClassById(obj)
  }

  const getClassById = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.Class.get,
      parameters: parameters
    })
      .then(res => {
        classValidation.setValues(populateClass(res.record))
        setEditMode(true)
        setWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.DRClasses, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 50 })
        getLabels(ResourceIds.DRClasses, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  // Characteristic Tab

  const characteristicValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      chId: yup.string().required('This field is required'),
      seqNo: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postCharacteristic(values)
    }
  })

  const postCharacteristic = obj => {
    const classId = obj.classId ? obj.classId : classValidation.values.recordId
    obj.classId = classId
    postRequest({
      extension: DocumentReleaseRepository.ClassCharacteristics.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        if (!classId) {
          toast.success('Record Added Successfully')
        } else toast.success('Record Editted Successfully')

        setCharacteristicWindowOpen(false)
        getCharacteristicGridData(classId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }


  const getCharacteristicGridData = classId => {
    setCharacteristicGridData([])
    const defaultParams = `_classId=${classId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.ClassCharacteristics.qry,
      parameters: parameters
    })
      .then(res => {
        setCharacteristicGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delCharacteristic = obj => {
    postRequest({
      extension: DocumentReleaseRepository.ClassCharacteristics.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Deleted Successfully')
        getCharacteristicGridData(obj.classId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addCharacteristic = () => {
    fillCharacteristicComboStore({ _startAt: 0, _pageSize: 1000 })
    setCharacValueComboStore([])
    characteristicValidation.setValues(getNewClassCharacteristics(classValidation.values.recordId))
    setCharacteristicWindowOpen(true)
  }

 /* const editCharacteristic = obj => {
    console.log(obj)
    getCharacteristicById(obj)
  }

   const getCharacteristicById = obj => {
    const _codeId = obj.codeId
    const _groupId = obj.groupId
    const defaultParams = `_codeId=${_codeId}&_groupId=${_groupId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.GroupCode.get,
      parameters: parameters
    })
      .then(res => {
        characteristicValidation.setValues(populateClassCharacteristics(res.record))
        setCharacteristicEditMode(true)
        setCharacteristicWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  } */

  const handleCharacteristicSubmit = () => {
    characteristicValidation.handleSubmit()
  }

  const fillCharacteristicComboStore = ({ _startAt = 0, _pageSize = 1000 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.CharacteristicsGeneral.qry,
      parameters: parameters
    })
      .then(res => {
        setCharacteristicComboStore(res)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const fillCharacValueComboStore = chId => {
    setCharacValueComboStore([])
    const defaultParams = `_chId=${chId}`
    var parameters = defaultParams
    chId && getRequest({
      extension: DocumentReleaseRepository.CharacteristicsValues.qry,
      parameters: parameters
    })
      .then(res => {
        setCharacValueComboStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  // Function Tab

  const functionValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      functionId: yup.string().required('This field is required'),
      strategyId: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postFunction(values)
    }
  })

  const postFunction = obj => {
    const classId = obj.classId ? obj.classId : classValidation.values.recordId
    obj.classId = classId
    postRequest({
      extension: DocumentReleaseRepository.ClassFunction.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        if (!classId) {
          toast.success('Record Added Successfully')
        } else toast.success('Record Editted Successfully')

        setFunctionWindowOpen(false)
        getFunctionGridData(classId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }


  const getFunctionGridData = classId => {
    setFunctionGridData([])
    const defaultParams = `_classId=${classId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.ClassFunction.qry,
      parameters: parameters
    })
      .then(res => {
        setFunctionGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delFunction = obj => {
    postRequest({
      extension: DocumentReleaseRepository.ClassFunction.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Deleted Successfully')
        getFunctionGridData(obj.classId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addFunction = () => {
    fillFunctionComboStore()
    fillFunctionStrategyComboStore({})
    functionValidation.setValues(getNewClassFunction(classValidation.values.recordId))
    setFunctionWindowOpen(true)
  }

  const editFunction = obj => {
    fillFunctionComboStore()
    fillFunctionStrategyComboStore({})
    console.log(obj)
    getFunctionById(obj)
  }

   const getFunctionById = obj => {
    const _functionId = obj.functionId
    const _classId = obj.classId
    const defaultParams = `_functionId=${_functionId}&_classId=${_classId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.ClassFunction.get,
      parameters: parameters
    })
      .then(res => {
        functionValidation.setValues(populateClassFunction(res.record))
        setFunctionEditMode(true)
        setFunctionWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  } 

  const handleFunctionSubmit = () => {
    functionValidation.handleSubmit()
  }

  const fillFunctionComboStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.SYSTEM_FUNCTION,
      callback: setFunctionComboStore
    })
  }

  const fillFunctionStrategyComboStore = ({ _startAt = 0, _pageSize = 1000 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.Strategy.qry,
      parameters: parameters
    })
      .then(res => {
        setFunctionStrategyComboStore(res)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
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
        <GridToolbar onAdd={addClass} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editClass}
          onDelete={delClass}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <ClassWindow
          onClose={() => setWindowOpen(false)}
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          width={600}
          height={400}
          onSave={handleSubmit}
          classValidation={classValidation}
          _labels={_labels}
          maxAccess={access}
          editMode={editMode}
          charOperatorComboStore={charOperatorComboStore}

          //Characteristic tab (grid)
          characteristicGridData={characteristicGridData}
          getCharacteristicGridData={getCharacteristicGridData}
          addCharacteristic={addCharacteristic}
          delCharacteristic={delCharacteristic}

          //Function tab (grid)
          functionGridData={functionGridData}
          getFunctionGridData={getFunctionGridData}
          addFunction={addFunction}
          delFunction={delFunction}
          editFunction={editFunction}
        />
      )}
      {characteristicWindowOpen && (
        <CharacteristicWindow
          onClose={() => setCharacteristicWindowOpen(false)}
          onSave={handleCharacteristicSubmit}
          characteristicValidation={characteristicValidation}
          characteristicComboStore={characteristicComboStore.list}
          characValueComboStore={characValueComboStore}
          fillCharacValueComboStore={fillCharacValueComboStore}
          maxAccess={access}
          _labels={_labels}
        />
      )}
      {functionWindowOpen && (
        <FunctionWindow
          onClose={() => setFunctionWindowOpen(false)}
          onSave={handleFunctionSubmit}
          functionValidation={functionValidation}
          functionComboStore={functionComboStore}
          functionStrategyComboStore={functionStrategyComboStore.list}
          maxAccess={access}
          _labels={_labels}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default Classes
