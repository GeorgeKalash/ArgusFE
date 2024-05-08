import { useEffect, useState, useContext } from 'react'
import { Box } from '@mui/material'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { RequestsContext } from 'src/providers/RequestsContext'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { getNewSecurityGroup, populateSecurityGroup } from 'src/Models/AccessControl/SecurityGroup'
import GroupInfoWindow from './Windows/GroupInfoWindow'
import UsersWindow from './Windows/UsersWindow'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'

const SecurityGroup = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //stores
  const [gridData, setGridData] = useState([])

  //states
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [activeTab, setActiveTab] = useState(0)

  //states of users tab
  const [initialAllListData, setAllUsers] = useState([])
  const [initialSelectedListData, setSelectedUsers] = useState([])
  const [usersGridData, setUsersGridData] = useState([])
  const [usersWindowOpen, setUsersWindowOpen] = useState(false)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  const _labels = {
    securityGroup: labels && labels.find(item => item.key === '1').value,
    name: labels && labels.find(item => item.key === '2').value,
    description: labels && labels.find(item => item.key === '3').value,
    email: labels && labels.find(item => item.key === '4').value,
    groupInfo: labels && labels.find(item => item.key === '5').value,
    users: labels && labels.find(item => item.key === '6').value,
    all: labels && labels.find(item => item.key === '7').value,
    inGroup: labels && labels.find(item => item.key === '8').value,
    groupUsers: labels && labels.find(item => item.key === '9').value
  }
  const itemSelectorLabels = [_labels.groupUsers, _labels.all, _labels.inGroup]

  const columns = [
    {
      field: 'name',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'description',
      headerName: _labels.description,
      flex: 1
    }
  ]

  const tabs = [{ label: _labels.groupInfo }, { label: _labels.users, disabled: !editMode }]

  const groupInfoValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      name: yup.string().required('This field is required')
    }),
    onSubmit: values => {
      postSecurityGroup(values)
    }
  })

  const usersValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({}),
    initialValues: {
      sgId: '',
      fullName: '',
      userId: ''
    },
    onSubmit: values => {
      postUsers()
    }
  })

  //Group Info Tab
  const handleSubmit = () => {
    if (activeTab === 0) groupInfoValidation.handleSubmit()
    if (activeTab === 1) usersValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&filter=`
    var parameters = defaultParams

    getRequest({
      extension: AccessControlRepository.SecurityGroup.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postSecurityGroup = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: AccessControlRepository.SecurityGroup.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        groupInfoValidation.setFieldValue('recordId', res.recordId)
        setWindowOpen(true)
        setEditMode(true)
        if (!recordId) toast.success('Record Added Successfully')
        else toast.success('Record Edited Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delSecurityGroup = obj => {
    postRequest({
      extension: AccessControlRepository.SecurityGroup.del,
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

  const addSecurityGroup = () => {
    setActiveTab(0)
    groupInfoValidation.setValues(getNewSecurityGroup())
    setUsersGridData([])
    setEditMode(false)
    setWindowOpen(true)
  }

  const editSecurityGroup = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: AccessControlRepository.SecurityGroup.get,
      parameters: parameters
    })
      .then(res => {
        groupInfoValidation.setValues(populateSecurityGroup(res.record))
        setEditMode(true)
        setWindowOpen(true)
        setActiveTab(0)
        getUsersGridData(res.record.recordId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  //Users Tab
  const handleUsersSubmit = () => {
    if (usersValidation) {
      usersValidation.handleSubmit()
    }
  }

  const getUsersGridData = sgId => {
    setUsersGridData([])
    const defaultParams = `_userId=0&_filter=&_sgId=${sgId}`
    var parameters = defaultParams

    getRequest({
      extension: AccessControlRepository.SecurityGroupUser.qry,
      parameters: parameters
    })
      .then(res => {
        setUsersGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addUsers = () => {
    try {
      setAllUsers([])
      setSelectedUsers([])

      const sgId = groupInfoValidation.values.recordId
      const defaultParams = `_filter=&_size=100&_startAt=0&_userId=0&_pageSize=50&_sgId=${sgId}`
      const usersDefaultParams = `_startAt=${0}&_pageSize=${50}&_size=${50}&_filter=&_sortBy=fullName`
      var parameters = defaultParams

      const USRequest = getRequest({
        extension: SystemRepository.Users.qry,
        parameters: usersDefaultParams
      })

      const GUSRequest = getRequest({
        extension: AccessControlRepository.SecurityGroupUser.qry,
        parameters: parameters
      })

      Promise.all([USRequest, GUSRequest]).then(([resUSFunction, resGUSTemplate]) => {
        const allList = resUSFunction.list.map(x => {
          const n = {
            id: x.recordId,
            name: x.fullName
          }

          return n
        })

        const selectedList = resGUSTemplate.list.map(x => {
          const n2 = {
            id: x.userId,
            name: x.fullName
          }

          return n2
        })
        setSelectedUsers(selectedList)

        // Remove items from allList that have the same sgId and userId as items in selectedList
        const filteredAllList = allList.filter(item => {
          return !selectedList.some(selectedItem => selectedItem.id === item.id && selectedItem.id === item.id)
        })
        setAllUsers(filteredAllList)
      })
      setUsersWindowOpen(true)
    } catch (error) {
      setErrorMessage(error.res)

      return Promise.reject(error) // You can choose to reject the promise if an error occurs
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleListsDataChange = (allData, selectedData) => {
    // Update the state in the parent component when the child component data changes
    setAllUsers(allData)
    setSelectedUsers(selectedData)
  }

  const postUsers = () => {
    const sgId = groupInfoValidation.values.recordId
    const selectedItems = []

    //initialSelectedListData returns an array that contain id, where id is userId
    //so we add selectedItems array that loops on initialSelectedListData & pass sgId beside userId to each object (this new array will be sent to set2GUS)
    initialSelectedListData.forEach(item => {
      selectedItems.push({ sgId: sgId, userId: item.id })
    })

    const data = {
      sgId: sgId,
      userId: 0,
      groups: selectedItems
    }

    postRequest({
      extension: AccessControlRepository.SecurityGroupUser.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        setUsersWindowOpen(false)
        getUsersGridData(sgId)
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

  const delUsers = obj => {
    const sgId = groupInfoValidation.values.recordId

    postRequest({
      extension: AccessControlRepository.SecurityGroupUser.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Deleted Successfully')
        getUsersGridData(sgId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }
  useEffect(() => {
    if (!access) getAccess(ResourceIds.SecurityGroup, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 50 })
        getLabels(ResourceIds.SecurityGroup, setLabels)
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access])

  return (
    <VertLayout>
      <Fixed>
        <GridToolbar onAdd={addSecurityGroup} maxAccess={access} />
      </Fixed>
      <Grow>
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editSecurityGroup}
          onDelete={delSecurityGroup}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          paginationType='client'
        />
      </Grow>
      {windowOpen && (
        <GroupInfoWindow
          onClose={() => setWindowOpen(false)}
          width={700}
          height={400}
          onSave={handleSubmit}
          labels={_labels}
          maxAccess={access}
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          groupInfoValidation={groupInfoValidation}
          usersValidation={usersValidation}
          usersGridData={usersGridData}
          getUsersGridData={getUsersGridData}
          delUsers={delUsers}
          addUsers={addUsers}
        />
      )}
      {usersWindowOpen && (
        <UsersWindow
          onClose={() => setUsersWindowOpen(false)}
          onSave={handleUsersSubmit}
          initialAllListData={initialAllListData}
          initialSelectedListData={initialSelectedListData}
          handleListsDataChange={handleListsDataChange}
          maxAccess={access}
          itemSelectorLabels={itemSelectorLabels}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </VertLayout>
  )
}

export default SecurityGroup
