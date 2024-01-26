// ** React Imports
import { useEffect, useState, useContext, useCallback } from 'react'

// ** MUI Imports
import { Box } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import { InventoryRepository } from 'src/repositories/InventoryRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { AccountRepository } from 'src/repositories/AccountRepository'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { SaleRepository } from 'src/repositories/SaleRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { CommonContext } from 'src/providers/CommonContext'
import { DataSets } from 'src/resources/DataSets'
import { getNewUserInfo, populateUserInfo } from 'src/Models/System/UserInfo'

// ** Windows
import UsersWindow from './Windows/UsersWindow'
import SecurityGroupWindow from './Windows/SecurityGroupWindow'

// ** Helpers
import ErrorWindow from 'src/components/Shared/ErrorWindow'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'

const Users = () => {
  const { getRequest, postRequest, getIdentityRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)
  const { getAllKvsByDataset } = useContext(CommonContext)

  //stores
  const [gridData, setGridData] = useState([])
  const [activeStatusStore, setActiveStatusStore] = useState([])
  const [userTypeStore, setUserTypeStore] = useState([])
  const [languageStore, setLanguageStore] = useState([])
  const [notificationGrpStore, setNotificationGrpStore] = useState([])
  const [employeeStore, setEmployeeStore] = useState([])

  const [siteStore, setSiteStore] = useState([])
  const [plantStore, setPlantStore] = useState([])
  const [cashAccStore, setCashAccStore] = useState([])
  const [salesPersonStore, setSalesPersonStore] = useState([])
  const [securityGrpGridData, setSecurityGrpGridData] = useState([])
  const [initialAllListData, setSecurityGrpALLData] = useState([])
  const [initialSelectedListData, setSecurityGrpSelectedData] = useState([])

  //states
  const [activeTab, setActiveTab] = useState(0)
  const [windowOpen, setWindowOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [emailPresent, setEmailPresent] = useState(false)
  const [passwordState, setPasswordState] = useState(false)
  const [securityGrpWindowOpen, setSecurityGrpWindowOpen] = useState(false)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)

  //Users Tab
  const _labels = {
    users: labels && labels.find(item => item.key === '1').value,
    username: labels && labels.find(item => item.key === '2').value,
    email: labels && labels.find(item => item.key === '3').value,
    cellPhone: labels && labels.find(item => item.key === '4').value,
    activeStatus: labels && labels.find(item => item.key === '5').value,
    userType: labels && labels.find(item => item.key === '6').value,
    language: labels && labels.find(item => item.key === '7').value,
    notificationGrp: labels && labels.find(item => item.key === '8').value,
    employee: labels && labels.find(item => item.key === '9').value,
    umcpnl: labels && labels.find(item => item.key === '10').value,
    site: labels && labels.find(item => item.key === '11').value,
    plant: labels && labels.find(item => item.key === '12').value,
    cashAcc: labels && labels.find(item => item.key === '13').value,
    salesPerson: labels && labels.find(item => item.key === '14').value,
    defaults: labels && labels.find(item => item.key === '15').value,
    password: labels && labels.find(item => item.key === '16').value,
    name: labels && labels.find(item => item.key === '17').value,
    confirmPassword: labels && labels.find(item => item.key === '18').value,
    securityGrp: labels && labels.find(item => item.key === '19').value,
    all: labels && labels.find(item => item.key === '20').value,
    selected: labels && labels.find(item => item.key === '21').value,
    group: labels && labels.find(item => item.key === '22').value
  }

  const itemSelectorLabels=[_labels.securityGrp,_labels.all,_labels.selected]

  const columns = [
    {
      field: 'fullName',
      headerName: _labels.name,
      flex: 1
    },
    {
      field: 'username',
      headerName: _labels.username,
      flex: 1
    },
    {
      field: 'email',
      headerName: _labels.email,
      flex: 1
    },
    {
      field: 'userTypeName',
      headerName: _labels.username,
      flex: 1
    },
    {
      field: 'languageName',
      headerName: _labels.language,
      flex: 1
    },
    {
      field: 'activeStatusName',
      headerName: _labels.activeStatus,
      flex: 1
    }
  ]

  const tabs = [
    { label: _labels.users },
    { label: _labels.defaults, disabled: !editMode },
    { label: _labels.securityGrp, disabled: !editMode }
  ]

  const usersValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      fullName: yup.string().required('This field is required'),
      username: yup.string().required('This field is required'),
      email: yup.string().required('This field is required'),
      activeStatus: yup.string().required('This field is required'),
      userType: yup.string().required('This field is required'),
      languageId: yup.string().required('This field is required'),

      //if passwordState is false, then the password and confirmPassword fields are added to the schema using object spreading.
      // else an empty object is added, ensuring those fields are not included in the schema.
      //spread syntax (...)
      ...(passwordState
        ? {}
        : {
            password: yup.string().required('This field is required'),
            confirmPassword: yup.string().required('This field is required')
          })
    }),
    onSubmit: values => {
      postUsers(values)
    }
  })

  const defaultsValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({}),
    initialValues: {
      siteId: '',
      plantId: '',
      spId: '',
      cashAccountId: '',
      cashAccountRef: '',
      cashAccountName: ''
    },
    onSubmit: values => {
      postDefaults(values)
    }
  })

  const securityGrpValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({}),
    initialValues: {
      sgId: '',
      sgName: '',
      userId: ''
    },
    onSubmit: values => {
      postSecurityGrp()
    }
  })

  const handleSubmit = () => {
    if (activeTab === 0) usersValidation.handleSubmit()
    else if (activeTab === 1 && (defaultsValidation.values != undefined || defaultsValidation.values != null)) {
      defaultsValidation.handleSubmit()
    } else if (activeTab === 2) securityGrpValidation.handleSubmit()
  }

  const getGridData = ({ _startAt = 0, _pageSize = 50 }) => {
    const defaultParams = `_startAt=${_startAt}&_pageSize=${_pageSize}&_size=${_pageSize}&_filter=&_sortBy=fullName`
    var parameters = defaultParams

    getRequest({
      extension: SystemRepository.Users.qry,
      parameters: parameters
    })
      .then(res => {
        setGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postUsers = obj => {
    const recordId = obj.recordId
    postRequest({
      extension: SystemRepository.Users.set,
      record: JSON.stringify(obj)
    })
      .then(res => {
        getGridData({})
        fillSiteStore()
        fillPlantStore()
        fillSalesPersonStore()
        usersValidation.setFieldValue('recordId', res.recordId)
        setWindowOpen(true)
        setEditMode(true)
        if (!recordId) toast.success('Record Added Successfully')
        else toast.success('Record Edited Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const delUsers = obj => {
    postRequest({
      extension: SystemRepository.Users.del,
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

  const addUsers = () => {
    defaultsValidation.resetForm()
    usersValidation.setValues(getNewUserInfo())
    setActiveTab(0)
    setEditMode(false)
    setWindowOpen(true)
    fillActiveStatusStore()
    fillUserTypeStore()
    fillLanguageStore()
    fillNotificationGrpStore()
    setPasswordState(false)
    setSecurityGrpGridData([])
  }

  const editUsers = obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams
    getRequest({
      extension: SystemRepository.Users.get,
      parameters: parameters
    })
      .then(res => {
        usersValidation.setValues(populateUserInfo(res.record))
        setEditMode(true)
        setWindowOpen(true)
        fillActiveStatusStore()
        fillUserTypeStore()
        fillLanguageStore()
        fillNotificationGrpStore()
        fillSiteStore()
        fillPlantStore()
        fillSalesPersonStore()
        getSecurityGrpGridData(res.record.recordId)
        setPasswordState(true)
        getDefaultsById(obj)
        setActiveTab(0)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillActiveStatusStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.ACTIVE_STATUS,
      callback: setActiveStatusStore
    })
  }

  const fillUserTypeStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.USER_TYPE,
      callback: setUserTypeStore
    })
  }

  const fillLanguageStore = () => {
    getAllKvsByDataset({
      _dataset: DataSets.LANGUAGE,
      callback: setLanguageStore
    })
  }

  const fillNotificationGrpStore = () => {
    var parameters = `filter=`
    getRequest({
      extension: AccessControlRepository.NotificationGroup.qry,
      parameters: parameters
    })
      .then(res => {
        setNotificationGrpStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const lookupEmployee = searchQry => {
    var parameters = `_size=50&_startAt=0&_filter=${searchQry}&_branchId=0`
    getRequest({
      extension: EmployeeRepository.Employee.snapshot,
      parameters: parameters
    })
      .then(res => {
        setEmployeeStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const checkFieldDirect = email => {
    const defaultParams = `_email=${email}`
    var parameters = defaultParams
    getIdentityRequest({
      extension: AccountRepository.UserIdentity.check,
      parameters: parameters
    })
      .then(res => {
        setEmailPresent(false)
        setPasswordState(false)
        usersValidation.validateForm()
      })
      .catch(error => {
        setErrorMessage(error)
        if (error.response.status == 300) {
          setEmailPresent(true)
          setPasswordState(true)
          usersValidation.validateForm()
        } else {
          setEmailPresent(false)
          setPasswordState(false)
          usersValidation.validateForm()
        }
      })
  }

  //Defaults Tab

  const postDefaults = obj => {
    const recordId = usersValidation.values.recordId
    const fields = ['cashAccountId', 'plantId', 'siteId', 'spId']

    const postField = field => {
      const request = {
        key: field,
        value: obj[field] !== null ? obj[field].toString() : null,
        userId: recordId
      }
      postRequest({
        extension: SystemRepository.UserDefaults.set,
        record: JSON.stringify(request)
      })
        .then(res => {})
        .catch(error => {
          setErrorMessage(error)
        })
    }
    fields.forEach(postField)
    getGridData({})
    setWindowOpen(true)
    if (!recordId) toast.success('Record Added Successfully')
    else toast.success('Record Edited Successfully')
  }

  const getDefaultsById = async obj => {
    try {
      const _recordId = obj.recordId
      const defaultParams = `_userId=${_recordId}`
      const parameters = defaultParams

      const res = await getRequest({
        extension: SystemRepository.UserDefaults.qry,
        parameters: parameters
      })

      const UserDocObject = {
        plantId: null,
        siteId: null,
        cashAccountId: null,
        cashAccountRef: null,
        cashAccountName: null,
        spId: null
      }

      await Promise.all(
        res.list.map(async x => {
          switch (x.key) {
            case 'plantId':
              UserDocObject.plantId = x.value ? parseInt(x.value) : null
              break
            case 'siteId':
              UserDocObject.siteId = x.value ? parseInt(x.value) : null
              break
            case 'cashAccountId':
              UserDocObject.cashAccountId = x.value ? parseInt(x.value) : null
              await getACC(UserDocObject.cashAccountId, UserDocObject)
              break
            case 'spId':
              UserDocObject.spId = x.value ? parseInt(x.value) : null
              break
            default:
              break
          }
        })
      )

      await defaultsValidation.setValues(UserDocObject)
    } catch (error) {
      setErrorMessage(error)
    }
  }

  const getACC = async (cashAccId, UserDocObject) => {
    if (cashAccId != null) {
      try {
        const defaultParams = `_recordId=${cashAccId}`
        const parameters = defaultParams

        const res = await getRequest({
          extension: CashBankRepository.CashAccount.get,
          parameters: parameters
        })
        UserDocObject.cashAccountRef = res.record.accountNo
        UserDocObject.cashAccountName = res.record.name

        return UserDocObject
      } catch (error) {
        setErrorMessage(error)
      }
    }
  }

  const fillSiteStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: InventoryRepository.Site.qry,
      parameters: parameters
    })
      .then(res => {
        setSiteStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const fillPlantStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Plant.qry,
      parameters: parameters
    })
      .then(res => {
        setPlantStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const fillSalesPersonStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: SaleRepository.SalesPerson.qry,
      parameters: parameters
    })
      .then(res => {
        setSalesPersonStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error.response.data)
      })
  }

  const lookupCashAcc = searchQry => {
    var parameters = `_size=50&_startAt=0&_filter=${searchQry}&_type=0`
    getRequest({
      extension: CashBankRepository.CashAccount.snapshot,
      parameters: parameters
    })
      .then(res => {
        setCashAccStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  //Security Grp Tab
  const handleSecurityGrpSubmit = () => {
    if (securityGrpValidation) {
      securityGrpValidation.handleSubmit()
    }
  }

  const getSecurityGrpGridData = userId => {
    setSecurityGrpGridData([])
    const defaultParams = `_userId=${userId}&_filter=&_sgId=0`
    var parameters = defaultParams

    getRequest({
      extension: AccessControlRepository.SecurityGroupUser.qry,
      parameters: parameters
    })
      .then(res => {
        setSecurityGrpGridData(res)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const addSecurityGrp = () => {
    try {
      setSecurityGrpALLData([])
      setSecurityGrpSelectedData([])

      const userId = usersValidation.values.recordId
      const defaultParams = `_filter=&_size=100&_startAt=0&_userId=${userId}&_pageSize=50&_sgId=0`
      var parameters = defaultParams

      const GrpRequest = getRequest({
        extension: AccessControlRepository.SecurityGroup.qry,
        parameters: parameters
      })

      const GUSRequest = getRequest({
        extension: AccessControlRepository.SecurityGroupUser.qry,
        parameters: parameters
      })

      Promise.all([GrpRequest, GUSRequest]).then(([resGRPFunction, resGUSTemplate]) => {
        const allList = resGRPFunction.list.map(x => {
          const n = {
            id: x.recordId,
            name: x.name, 
          }

          return n
        })

        const selectedList = resGUSTemplate.list.map(x => {
          const n2 = {
            id: x.sgId,
            name: x.sgName
          }

          return n2
        })
        setSecurityGrpSelectedData(selectedList)

        // Remove items from allList that have the same sgId and userId as items in selectedList
        const filteredAllList = allList.filter(item => {
          return !selectedList.some(
            selectedItem => selectedItem.id === item.id && selectedItem.id === item.id
          )
        })
        setSecurityGrpALLData(filteredAllList)
      })
      setSecurityGrpWindowOpen(true)
    } catch (error) {
      setErrorMessage(error.res)

      return Promise.reject(error) // You can choose to reject the promise if an error occurs
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleListsDataChange = (allData, selectedData) => {
    // Update the state in the parent component when the child component data changes
    setSecurityGrpALLData(allData)
    setSecurityGrpSelectedData(selectedData)
  }

  const postSecurityGrp = () => {
    const userId = usersValidation.values.recordId
    const selectedItems = [];
 
    //initialSelectedListData returns an array that contain id, where id is sgId
   //so we add selectedItems array that loops on initialSelectedListData & pass userId beside sgId to each object (this new array will be sent to set2GUS)
    initialSelectedListData.forEach(item => {
      selectedItems.push({userId:userId , sgId: item.id})
  });

    const data = {
      sgId: 0,
      userId: userId,
      groups: selectedItems
    }

    postRequest({
      extension: AccessControlRepository.SecurityGroupUser.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        setSecurityGrpWindowOpen(false)
        getSecurityGrpGridData(userId)
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

  const delSecurityGrp = obj => {
    const userId = usersValidation.values.recordId

    postRequest({
      extension: AccessControlRepository.SecurityGroupUser.del,
      record: JSON.stringify(obj)
    })
      .then(res => {
        toast.success('Record Deleted Successfully')
        getSecurityGrpGridData(userId)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (!access) getAccess(ResourceIds.Users, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getGridData({ _startAt: 0, _pageSize: 50 })
        getLabels(ResourceIds.Users, setLabels)
        fillActiveStatusStore()
        fillUserTypeStore()
        fillLanguageStore()
        fillNotificationGrpStore()
      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [access])

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <GridToolbar onAdd={addUsers} maxAccess={access} />
        <Table
          columns={columns}
          gridData={gridData}
          rowId={['recordId']}
          api={getGridData}
          onEdit={editUsers}
          onDelete={delUsers}
          isLoading={false}
          pageSize={50}
          maxAccess={access}
          paginationType='client'
        />
      </Box>
      {windowOpen && (
        <UsersWindow
          onClose={() => setWindowOpen(false)}
          width={800}
          height={400}
          onSave={handleSubmit}
          labels={_labels}
          maxAccess={access}
          editMode={editMode}
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          
          //Users
          usersValidation={usersValidation}
          notificationGrpStore={notificationGrpStore}
          languageStore={languageStore}
          userTypeStore={userTypeStore}
          activeStatusStore={activeStatusStore}
          employeeStore={employeeStore}
          setEmployeeStore={setEmployeeStore}
          lookupEmployee={lookupEmployee}
          checkFieldDirect={checkFieldDirect}
          emailPresent={emailPresent}
          passwordState={passwordState}
          setPasswordState={setPasswordState}

          //Defaults
          defaultsValidation={defaultsValidation}
          siteStore={siteStore}
          plantStore={plantStore}
          salesPersonStore={salesPersonStore}
          setCashAccStore={setCashAccStore}
          cashAccStore={cashAccStore}
          lookupCashAcc={lookupCashAcc}

          //Security Grp
          securityGrpGridData={securityGrpGridData}
          getSecurityGrpGridData={getSecurityGrpGridData}
          delSecurityGrp={delSecurityGrp}
          addSecurityGrp={addSecurityGrp}
        />
      )}
      {securityGrpWindowOpen && (
        <SecurityGroupWindow
          onClose={() => setSecurityGrpWindowOpen(false)}
          onSave={handleSecurityGrpSubmit}
          initialAllListData={initialAllListData}
          initialSelectedListData={initialSelectedListData}
          handleListsDataChange={handleListsDataChange}
          itemSelectorLabels={itemSelectorLabels}
          maxAccess={access}
        />
      )}
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default Users
