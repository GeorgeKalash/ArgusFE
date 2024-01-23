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
import { getNewStrategy, populateStrategy } from 'src/Models/DocumentRelease/Strategy'
import { getNewStrategyCode, populateStrategyCode } from 'src/Models/DocumentRelease/StrategyCode'
import { getNewStrategyPrerequisite, populateStrategyPrerequisite } from 'src/Models/DocumentRelease/StrategyPrerequisite'
import { getNewStrategyIndicator, populateStrategyIndicator } from 'src/Models/DocumentRelease/StrategyIndicator' //delete class?


// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'

// ** Windows
import StrategyWindow from './Windows/StrategyWindow'
import CodeWindow from './Windows/CodeWindow'
import PrerequisiteWindow from './Windows/PrerequisiteWindow'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'

const Strategy = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  //controls
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])
  const [typeComboStore, setTypeComboStore] = useState([])
  const [strategyGroupComboStore, setStrategyGroupComboStore] = useState([])

  const [codeGridData, setCodeGridData] = useState([]) //for code tab
  const [codeComboStore, setCodeComboStore] = useState([]) //combo in code window

  const [prerequisiteGridData, setPrerequisiteGridData] = useState([]) //for prerequisite tab
  const [groupComboStore, setGroupComboStore] = useState([]) //combo in prerequisite window
  const [prerequisiteComboStore, setPrerequisiteComboStore] = useState([]) //prerequisite combo in prerequisite window

  //const [indicatorGridData, setIndicatorGridData] = useState([]) //for Indicator tab
  const [indicatorComboStore, setIndicatorComboStore] = useState([])

  //states
  const [activeTab, setActiveTab] = useState(0)
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const [codeWindowOpen, setCodeWindowOpen] = useState(false)
  const [prerequisiteWindowOpen, setPrerequisiteWindowOpen] = useState(false)


  const _labels = {   
    strategy: labels && labels.find(item => item.key === "1").value,
    code: labels && labels.find(item => item.key === "2").value,
    prerequisite: labels && labels.find(item => item.key === "3").value,
    indicator: labels && labels.find(item => item.key === "4").value,
    name: labels && labels.find(item => item.key === "5").value,
    group: labels && labels.find(item => item.key === "6").value,
    type: labels && labels.find(item => item.key === "7").value,
    sequenceNumber: labels && labels.find(item => item.key === "8").value
  }

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'groupName',
      headerName: _labels.group,
      flex: 1
    }
  ]

  const tabs = [{ label: _labels.strategy }, { label: _labels.code, disabled: !editMode }, { label: _labels.prerequisite, disabled: !editMode }, { label: _labels.indicator, disabled: !editMode }]

  const strategyValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      name: yup.string().required('This field is required'),
      groupId: yup.string().required('This field is required'),
      type: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postStrategy(values)
    }
  })

  const handleSubmit = () => {
    if (activeTab === 0) {strategyValidation.handleSubmit() && indicatorGridValidation.handleSubmit()}
    else if (activeTab === 3) indicatorGridValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.Strategy.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData({ ...res, _startAt })
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postStrategy = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: DocumentReleaseRepository.Strategy.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        strategyValidation.setFieldValue('recordId', res.recordId)
        getGridData({})
        if (!recordId) {
          toast.success('Record Added Successfully')
          setEditMode(true)
          fillIndicatorComboStore({})
          resetCorrespondentIndicators()
        } else toast.success('Record Edited Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delStrategy = obj => {
    postRequest({
      extension: DocumentReleaseRepository.Strategy.del,
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

  const addStrategy = () => {
    strategyValidation.setValues(getNewStrategy)
    setCodeGridData([])
    setPrerequisiteGridData([])
    resetCorrespondentIndicators()

    //setIndicatorGridData([])
    fillTypeComboStore()
    fillIndicatorComboStore({})
    fillStrategyGroupComboStore({})
    setEditMode(false)
    setWindowOpen(true)
    setActiveTab(0)
  }

  const fillTypeComboStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.SY_TYPE,
      callback: setTypeComboStore
    })
  }

  const fillStrategyGroupComboStore = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.DRGroup.qry,
      parameters: parameters
    })
      .then(res => {
        setStrategyGroupComboStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }


  const editStrategy = obj => {
    setActiveTab(0)
    fillTypeComboStore()
    fillStrategyGroupComboStore({})
    fillIndicatorComboStore({})
    getCodeGridData(obj.recordId)
    getPrerequisiteGridData(obj.recordId)
    resetCorrespondentIndicators()
    getCorrespondentIndicators(obj.recordId)
    getStrategyById(obj)
  }

  const getStrategyById = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.Strategy.get,
      parameters: parameters
    })
      .then(res => {
        strategyValidation.setValues(populateStrategy(res.record))
        setEditMode(true)
        setWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.Strategies, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 50 })
        getLabels(ResourceIds.Strategies, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  // Code Tab

  const codeValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      codeId: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postCode(values)
    }
  })

  const postCode = obj => {
    const strategyId = obj.strategyId ? obj.strategyId : strategyValidation.values.recordId
    obj.strategyId = strategyId
    postRequest({
      extension: DocumentReleaseRepository.StrategyCode.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        if (!strategyId) {
          toast.success('Record Added Successfully')
        } else toast.success('Record Editted Successfully')

        setCodeWindowOpen(false)
        getCodeGridData(strategyId)
        getCorrespondentIndicators(strategyId)

        //fillCodeComboStore(strategyId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }


  const getCodeGridData = strategyId => {
    setCodeGridData([])
    const defaultParams = `_strategyId=${strategyId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.StrategyCode.qry,
      parameters: parameters
    })
      .then(res => {
        setCodeGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delCode = obj => {
    postRequest({
      extension: DocumentReleaseRepository.StrategyCode.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Deleted Successfully')
        getCodeGridData(obj.strategyId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addCode = () => {
    fillCodeComboStore(strategyValidation.values.groupId)
    codeValidation.setValues(getNewStrategyCode(strategyValidation.values.recordId))
    setCodeWindowOpen(true)
  }

  const handleCodeSubmit = () => {
    codeValidation.handleSubmit()
  }

  const fillCodeComboStore = (groupId) => {
    const defaultParams = `_groupId=${groupId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.GroupCode.qry,
      parameters: parameters
    })
      .then(res => {
        setCodeComboStore(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  // Prerequisite Tab

  const prerequisiteValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      codeId: yup.string().required('This field is required'),
      prerequisiteId: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postPrerequisite(values)
    }
  })

  const postPrerequisite = obj => {
    const strategyId = obj.strategyId ? obj.strategyId : strategyValidation.values.recordId
    obj.strategyId = strategyId
    postRequest({
      extension: DocumentReleaseRepository.StrategyPrereq.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        if (!strategyId) {
          toast.success('Record Added Successfully')
        } else toast.success('Record Editted Successfully')

        setPrerequisiteWindowOpen(false)
        getPrerequisiteGridData(strategyId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }


  const getPrerequisiteGridData = strategyId => {
    setPrerequisiteGridData([])
    const defaultParams = `_strategyId=${strategyId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.StrategyPrereq.qry,
      parameters: parameters
    })
      .then(res => {
        setPrerequisiteGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delPrerequisite = obj => {
    postRequest({
      extension: DocumentReleaseRepository.StrategyPrereq.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Deleted Successfully')
        getPrerequisiteGridData(obj.strategyId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addPrerequisite = () => {
    fillGroupComboStore(strategyValidation.values.recordId)
    prerequisiteValidation.setValues(getNewStrategyPrerequisite(strategyValidation.values.recordId))
    setPrerequisiteWindowOpen(true)
  }

  
  const fillGroupComboStore = (strategyId) => {
    const defaultParams = `_strategyId=${strategyId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.StrategyCode.qry,
      parameters: parameters
    })
      .then(res => {
        setGroupComboStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillPrerequisiteComboStore = (codeId) => { // store the list and fill this combo without second request??
    setPrerequisiteComboStore([])
    const defaultParams = `_strategyId=${strategyValidation.values.recordId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.StrategyCode.qry,
      parameters: parameters
    })
      .then(res => {
        console.log(res.list)
        setPrerequisiteComboStore(res.list.filter(item => item.codeId != codeId))
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }


  const handlePrerequisiteSubmit = () => {
    prerequisiteValidation.handleSubmit()
  }


  // Indicator Tab

  
  const fillIndicatorComboStore = ({ _startAt = 0, _pageSize = 1000 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.ReleaseIndicator.qry,
      parameters: parameters
    })
      .then(res => {
        setIndicatorComboStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

   const indicatorGridValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validate: values => {
      const isValidSeqno = values.rows.every(row => !!row.seqNo)
      const isValidIndicatorid = values.rows.every(row => !!row.indicatorId)
      const isValidName = values.rows.every(row => !!row.name)

      return  (isValidSeqno && isValidIndicatorid && isValidName )
          ? {}
          : { rows: Array(values.rows && values.rows.length).fill({ seqNo: 'Seq No is required',
          indicatorId: 'Indicator is required', name: 'Name is required' }) }
    },

    /*initialValues: {
      rows: [
        {
          strategyId: strategyValidation.values
            ? strategyValidation.values.recordId
              ? strategyValidation.values.recordId
              : ''
            : '',
          codeId: '', //check
          seqNo: '',
          indicatorId: '',
          name: ''
        }
      ]
    },*/
    onSubmit: values => {
      postIndicators(values.rows)
    }
  })

  const indicatorInlineGridColumns = [
    {
      field: 'numberfield',
      header: _labels.sequenceNumber,
      name: 'seqNo',
      min: 1
    },
    {
      field: 'textfield',
      header: _labels.name,
      name: 'name',
      mandatory: false,
      readOnly: true
    },
    {
      field: 'combobox',
      header: _labels.indicator,
      nameId: 'indicatorId',
      name: 'indicatorName',
      mandatory: true,
      store: indicatorComboStore,
      valueField: 'recordId',
      displayField: 'name',
      columnsInDropDown: [
        { key: 'reference', value: 'Ref' },
        { key: 'name', value: 'Indicator Name' }
      ]
    }
  ]

  const postIndicators = (obj) => {
    const data = {
      strategyId: strategyValidation.values.recordId,
      codeId: "0",
      items: obj
    }
    postRequest({
      extension: DocumentReleaseRepository.StrategyIndicator.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) 
        toast.success('Record Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const resetCorrespondentIndicators = () => {
    indicatorGridValidation.setValues({ rows: [] })
  }

  const getCorrespondentIndicators = (recordId) => {
    const _recordId = recordId
    const defaultParams = `_strategyId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.StrategyIndicator.qry,
      parameters: parameters
    })
      .then(res => {
        console.log(res)
        if (res.list.length > 0) indicatorGridValidation.setValues({ rows: res.list })
        else resetCorrespondentIndicators()
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const applyStrategy = () => {
    postRequest({
      extension: DocumentReleaseRepository.ApplySTG.apply,
      record: JSON.stringify(strategyValidation.values)
    })
      .then(res => {
        if (res) { 
          toast.success('Applied Successfully')
          getCorrespondentIndicators(strategyValidation.values.recordId)
        }
      })
      .catch(error => {
        setErrorMessage(error)
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
        <GridToolbar onAdd={addStrategy} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editStrategy}
          onDelete={delStrategy}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <StrategyWindow
          onClose={() => setWindowOpen(false)}
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          width={600}
          height={400}
          onSave={handleSubmit}
          onApply={applyStrategy}
          strategyValidation={strategyValidation}
          _labels={_labels}
          maxAccess={access}
          editMode={editMode}
          typeComboStore={typeComboStore}
          strategyGroupComboStore={strategyGroupComboStore}

          //Code tab (grid)
          codeGridData={codeGridData}
          getCodeGridData={getCodeGridData}
          addCode={addCode}
          delCode={delCode}

          //Prerequisite tab (grid)
          prerequisiteGridData={prerequisiteGridData}
          getPrerequisiteGridData={getPrerequisiteGridData}
          addPrerequisite={addPrerequisite}
          delPrerequisite={delPrerequisite}

          //Indicator Tab (grid)
          indicatorGridValidation={indicatorGridValidation}
          indicatorInlineGridColumns={indicatorInlineGridColumns}
        />
      )}
      {codeWindowOpen && (
        <CodeWindow
          onClose={() => setCodeWindowOpen(false)}
          onSave={handleCodeSubmit}
          codeValidation={codeValidation}
          codeComboStore={codeComboStore.list}
          maxAccess={access}
          _labels={_labels}
        />
      )}
      {prerequisiteWindowOpen && (
        <PrerequisiteWindow
          onClose={() => setPrerequisiteWindowOpen(false)}
          onSave={handlePrerequisiteSubmit}
          prerequisiteValidation={prerequisiteValidation}
          groupComboStore={groupComboStore}
          prerequisiteComboStore={prerequisiteComboStore}
          fillPrerequisiteComboStore={fillPrerequisiteComboStore}
          maxAccess={access}
          _labels={_labels}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default Strategy
