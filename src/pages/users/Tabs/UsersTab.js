// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomLookup from 'src/components/Inputs/CustomLookup'

// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** React Imports
import { useContext, useState } from 'react'
import { CommonContext } from 'src/providers/CommonContext'

const UsersTab = ({ labels, maxAccess, editMode }) => {
  const [activeStatusStore, setActiveStatusStore] = useState([])
  const [userTypeStore, setUserTypeStore] = useState([])
  const [languageStore, setLanguageStore] = useState([])
  const [notificationGrpStore, setNotificationGrpStore] = useState([])
  const [employeeStore, setEmployeeStore] = useState([])
  const [emailPresent, setEmailPresent] = useState(false)
  const [passwordState, setPasswordState] = useState(false)
  const { getAllKvsByDataset } = useContext(CommonContext)

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

  const editUsers = async obj => {
    const _recordId = obj.recordId
    const defaultParams = `_recordId=${_recordId}`
    var parameters = defaultParams

    const res = await getRequest({
      extension: SystemRepository.Users.get,
      parameters: parameters
    })
  }

  return (
    <Grid container>
      {/* First Column */}
      <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
        <Grid item xs={12}>
          <CustomTextField
            name='fullName'
            label={labels.name}
            value={usersValidation.values.fullName}
            required
            maxAccess={maxAccess}
            minLength='5'
            onChange={usersValidation.handleChange}
            onClear={() => usersValidation.setFieldValue('fullName', '')}
            error={usersValidation.touched.fullName && Boolean(usersValidation.errors.fullName)}
            helperText={usersValidation.touched.fullName && usersValidation.errors.fullName}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='username'
            label={labels.username}
            value={usersValidation.values.username}
            required
            maxAccess={maxAccess}
            minLength='6'
            maxLength='30'
            readOnly={editMode}
            onClear={() => usersValidation.setFieldValue('username', '')}
            error={usersValidation.touched.username && Boolean(usersValidation.errors.username)}
            helperText={usersValidation.touched.username && usersValidation.errors.username}
            onChange={e => {
              const inputValue = e.target.value
              if (/^[a-zA-Z0-9_.-@]*$/.test(inputValue)) {
                usersValidation.handleChange(e)
              }
            }}
            onBlur={e => {
              if (!editMode && e.target.value != '') {
                checkFieldDirect(e.target.value)
                setPasswordState(emailPresent)
              }
            }}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='email'
            label={labels.email}
            value={usersValidation.values.email}
            type='email'
            required
            placeholder='johndoe@email.com'
            readOnly={editMode}
            onChange={usersValidation.handleChange}
            onClear={() => usersValidation.setFieldValue('email', '')}
            error={usersValidation.touched.email && Boolean(usersValidation.errors.email)}
            helperText={usersValidation.touched.email && usersValidation.errors.email}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='cellPhone'
            label={labels.cellPhone}
            value={usersValidation.values.cellPhone}
            maxAccess={maxAccess}
            onChange={e => {
              const inputValue = e.target.value
              if (/^[0-9]*$/.test(inputValue)) {
                usersValidation.handleChange(e)
              }
            }}
            onClear={() => usersValidation.setFieldValue('cellPhone', '')}
            error={usersValidation.touched.cellPhone && Boolean(usersValidation.errors.cellPhone)}
            helperText={usersValidation.touched.cellPhone && usersValidation.errors.cellPhone}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomComboBox
            name='activeStatus'
            label={labels.activeStatus}
            valueField='key'
            displayField='value'
            store={activeStatusStore}
            value={activeStatusStore.filter(item => item.key === usersValidation.values.activeStatus?.toString())[0]}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              usersValidation.setFieldValue('activeStatus', newValue?.key)
            }}
            error={usersValidation.touched.activeStatus && Boolean(usersValidation.errors.activeStatus)}
            helperText={usersValidation.touched.activeStatus && usersValidation.errors.activeStatus}
          />
        </Grid>
      </Grid>
      <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
        <Grid item xs={12}>
          <CustomComboBox
            name='userType'
            label={labels.userType}
            valueField='key'
            displayField='value'
            store={userTypeStore}
            value={userTypeStore.filter(item => item.key === usersValidation.values.userType?.toString())[0]}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              usersValidation.setFieldValue('userType', newValue?.key)
            }}
            error={usersValidation.touched.userType && Boolean(usersValidation.errors.userType)}
            helperText={usersValidation.touched.userType && usersValidation.errors.userType}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomComboBox
            name='languageId'
            label={labels.language}
            valueField='key'
            displayField='value'
            store={languageStore}
            value={languageStore.filter(item => item.key === usersValidation.values.languageId?.toString())[0]}
            required
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              usersValidation.setFieldValue('languageId', newValue?.key)
            }}
            error={usersValidation.touched.languageId && Boolean(usersValidation.errors.languageId)}
            helperText={usersValidation.touched.languageId && usersValidation.errors.languageId}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomComboBox
            name='notificationGroupId'
            label={labels.notificationGrp}
            valueField='recordId'
            displayField='name'
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            store={notificationGrpStore}
            value={notificationGrpStore.filter(item => item.recordId === usersValidation.values.notificationGroupId)[0]}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
              usersValidation.setFieldValue('notificationGroupId', newValue?.recordId)
            }}
            error={usersValidation.touched.notificationGroupId && Boolean(usersValidation.errors.notificationGroupId)}
            helperText={usersValidation.touched.notificationGroupId && usersValidation.errors.notificationGroupId}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomLookup
            name='employeeId'
            label={labels.employee}
            valueField='reference'
            displayField='name'
            store={employeeStore}
            setStore={setEmployeeStore}
            firstValue={usersValidation.values.employeeRef}
            secondValue={usersValidation.values.employeeName}
            onLookup={lookupEmployee}
            onChange={(event, newValue) => {
              if (newValue) {
                usersValidation.setFieldValue('employeeId', newValue?.recordId)
                usersValidation.setFieldValue('employeeRef', newValue?.reference)
                usersValidation.setFieldValue('employeeName', newValue?.name)
              } else {
                usersValidation.setFieldValue('employeeId', null)
                usersValidation.setFieldValue('employeeRef', null)
                usersValidation.setFieldValue('employeeName', null)
              }
            }}
            error={usersValidation.touched.employeeId && Boolean(usersValidation.errors.employeeId)}
            helperText={usersValidation.touched.employeeId && usersValidation.errors.employeeId}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='password'
            label={labels.password}
            value={usersValidation.values.password}
            required
            hidden={editMode}
            readOnly={passwordState}
            maxAccess={maxAccess}
            onChange={usersValidation.handleChange}
            onClear={() => usersValidation.setFieldValue('password', '')}
            error={usersValidation.touched.password && Boolean(usersValidation.errors.password)}
            helperText={usersValidation.touched.password && usersValidation.errors.password}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='confirmPassword'
            label={labels.confirmPassword}
            value={usersValidation.values.confirmPassword}
            required
            hidden={editMode}
            readOnly={passwordState}
            maxAccess={maxAccess}
            onChange={usersValidation.handleChange}
            onClear={() => usersValidation.setFieldValue('confirmPassword', '')}
            error={usersValidation.touched.confirmPassword && Boolean(usersValidation.errors.confirmPassword)}
            helperText={usersValidation.touched.confirmPassword && usersValidation.errors.confirmPassword}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                name='umcpnl'
                maxAccess={maxAccess}
                checked={usersValidation.values?.umcpnl}
                onChange={usersValidation.handleChange}
              />
            }
            label={labels.umcpnl}
          />
        </Grid>
      </Grid>
    </Grid>
  )
}

export default UsersTab
