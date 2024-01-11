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
import { getNewDRGroup, populateDRGroup } from 'src/Models/DocumentRelease/DRGroup'
import { getNewGroupCode, populateGroupCode } from 'src/Models/DocumentRelease/GroupCode'


// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

// ** Windows
import DRGroupWindow from './Windows/DRGroupWindow'
import ApproverWindow from './Windows/ApproverWindow'
import { DocumentReleaseRepository } from 'src/repositories/DocumentReleaseRepository'

const DRGroups = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //controls
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  //stores
  const [gridData, setGridData] = useState([])

  const [approverGridData, setApproverGridData] = useState([]) //for approver tab
  const [approverComboStore, setApproverComboStore] = useState([]) //combo in approver window

  //states
  const [activeTab, setActiveTab] = useState(0)
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  const [approverWindowOpen, setApproverWindowOpen] = useState(false)
  const [approverEditMode, setApproverEditMode] = useState(false)

  const _labels = {
    reference: labels && labels.find(item => item.key === "1").value,
    name: labels && labels.find(item => item.key === "2").value,
    group: labels && labels.find(item => item.key === "3").value,
    approver: labels && labels.find(item => item.key === "4").value
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
    }
  ]

  const tabs = [{ label: _labels.group }, { label: _labels.approver, disabled: !editMode }]

  const drGroupValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      reference: yup.string().required('This field is required'),
      name: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      console.log(values)
      postDRGroup(values)
    }
  })

  const handleSubmit = () => {
    if (activeTab === 0) drGroupValidation.handleSubmit()
    
    //else if (activeTab === 1) approverValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.DRGroup.page,
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

  const postDRGroup = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: DocumentReleaseRepository.DRGroup.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        drGroupValidation.setFieldValue('recordId', res.recordId)
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

  const delDRGroup = obj => {
    postRequest({
      extension: DocumentReleaseRepository.DRGroup.del,
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

  const addDRGroup = () => {
    drGroupValidation.setValues(getNewDRGroup)
    setApproverGridData([])
    fillApproverComboStore({ _startAt: 0, _pageSize: 1000 })
    setEditMode(false)
    setWindowOpen(true)
    setActiveTab(0)
  }

  const editDRGroup = obj => {
    setActiveTab(0)
    console.log(obj)
    fillApproverComboStore({ _startAt: 0, _pageSize: 1000 })
    getApproverGridData(obj.recordId)
    getDRGroupById(obj)
  }

  const getDRGroupById = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.DRGroup.get,
      parameters: parameters
    })
      .then(res => {
        drGroupValidation.setValues(populateDRGroup(res.record))
        setEditMode(true)
        setWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.DRGroups, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 50 })
        getLabels(ResourceIds.DRGroups, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])

  // Approver Tab

  const approverValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      codeId: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postApprover(values)
    }
  })

  const postApprover = obj => {
    const codeId = obj.codeId
    const groupId = obj.groupId ? obj.groupId : drGroupValidation.values.recordId
    postRequest({
      extension: DocumentReleaseRepository.GroupCode.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        if (!codeId) {
          toast.success('Record Added Successfully')
        } else toast.success('Record Editted Successfully')

        setApproverWindowOpen(false)
        getApproverGridData(groupId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }


  const getApproverGridData = groupId => {
    setApproverGridData([])
    const defaultParams = `_groupId=${groupId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.GroupCode.qry,
      parameters: parameters
    })
      .then(res => {
        setApproverGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delApprover = obj => {
    postRequest({
      extension: DocumentReleaseRepository.GroupCode.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Deleted Successfully')
        getApproverGridData(obj.groupId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addApprover = () => {
    approverValidation.setValues(getNewGroupCode(drGroupValidation.values.recordId))
    setApproverWindowOpen(true)
  }

  const editApprover = obj => {
    console.log(obj)
    getApproverById(obj)
  }

   const getApproverById = obj => {
    const _codeId = obj.codeId
    const _groupId = obj.groupId
    const defaultParams = `_codeId=${_codeId}&_groupId=${_groupId}`
    var parameters = defaultParams
    getRequest({
      extension: DocumentReleaseRepository.GroupCode.get,
      parameters: parameters
    })
      .then(res => {
        approverValidation.setValues(populateGroupCode(res.record))
        setApproverEditMode(true)
        setApproverWindowOpen(true)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  } 

  const handleApproverSubmit = () => {
    approverValidation.handleSubmit()
  }

  const fillApproverComboStore = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}`
    var parameters = defaultParams
    console.log(_pageSize)
    getRequest({
      extension: DocumentReleaseRepository.ReleaseCode.qry,
      parameters: parameters
    })
      .then(res => {
        setApproverComboStore(res)
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
        <GridToolbar onAdd={addDRGroup} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editDRGroup}
          onDelete={delDRGroup}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
        />
      </Box>
      {windowOpen && (
        <DRGroupWindow
          onClose={() => setWindowOpen(false)}
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          width={600}
          height={400}
          onSave={handleSubmit}
          drGroupValidation={drGroupValidation}
          _labels={_labels}
          maxAccess={access}
          editMode={editMode}
          
          //Approver tab (grid)
          approverGridData={approverGridData}
          getApproverGridData={getApproverGridData}
          addApprover={addApprover}
          delApprover={delApprover}
          editApprover={editApprover}
        />
      )}
      {approverWindowOpen && (
        <ApproverWindow
          onClose={() => setApproverWindowOpen(false)}
          onSave={handleApproverSubmit}
          approverValidation={approverValidation}
          approverComboStore={approverComboStore.list}
          maxAccess={access}
          _labels={_labels}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default DRGroups
