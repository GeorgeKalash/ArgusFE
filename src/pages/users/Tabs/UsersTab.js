import CustomTextField from 'src/components/Inputs/CustomTextField'
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { RequestsContext } from 'src/providers/RequestsContext'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { DataSets } from 'src/resources/DataSets'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { EmployeeRepository } from 'src/repositories/EmployeeRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { AccountRepository } from 'src/repositories/AccountRepository'
import toast from 'react-hot-toast'
import { useInvalidate } from 'src/hooks/resource'
import { ControlContext } from 'src/providers/ControlContext'
import SHA1 from 'crypto-js/sha1'
import axios from 'axios'
import { getStorageData } from 'src/storage/storage'
import { SaleRepository } from 'src/repositories/SaleRepository'
import FormGrid from 'src/components/form/layout/FormGrid'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'

const UsersTab = ({ labels, maxAccess, storeRecordId, setRecordId }) => {
  const [emailPresent, setEmailPresent] = useState(false)
  const [passwordState, setPasswordState] = useState(false)
  const { getRequest, postRequest, getIdentityRequest } = useContext(RequestsContext)
  const editMode = !!storeRecordId
  const { platformLabels } = useContext(ControlContext)

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: storeRecordId || null,
      fullName: '',
      username: '',
      email: '',
      spRef: '',
      spName: '',
      cellPhone: '',
      activeStatus: '',
      userType: '',
      languageId: '',
      notificationGroupId: '',
      employeeId: '',
      otpDevice: '',
      spId: '',
      password: '',
      confirmPassword: '',
      platform: '',
      dashboardId: null,
      umcpnl: false,
      is2FAEnabled: false
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      fullName: yup.string().required(),
      username: yup.string().required(),
      email: yup.string().required(),
      activeStatus: yup.string().required(),
      userType: yup.string().required(),
      otpDevice: yup
        .string()
        .nullable()
        .test('', function (value) {
          const { is2FAEnabled } = this.parent
          if (is2FAEnabled) {
            return !!value
          }

          return true
        }),
      languageId: yup.string().required(),
      ...(passwordState
        ? {}
        : {
            password: yup.string().required(),
            confirmPassword: yup
              .string()
              .required()
              .oneOf([yup.ref('password'), null], 'Password must match')
          })
    }),
    onSubmit: async obj => {
      if (!storeRecordId) {
        const copy = { ...obj }
        const encryptedPassword = encryptePWD(copy.password)
        copy.password = copy.confirmPassword = encryptedPassword

        const user = getStorageData('userData')
        await axios.post(
          `${process.env.NEXT_PUBLIC_AuthURL}/MA.asmx/setID`,
          {
            record: JSON.stringify({
              accountId: user.accountId,
              spId: user.spId,
              userName: copy.username,
              password: copy.password,
              userId: copy.recordId
            })
          },
          {
            headers: {
              authorization: `Bearer ${user.accessToken}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        )
        postUS(copy)
      } else postUS(obj)
    }
  })

  async function postUS(obj) {
    const res = await postRequest({
      extension: SystemRepository.Users.set,
      record: JSON.stringify(obj)
    })
    if (!obj.recordId) {
      toast.success(platformLabels.Added)
      formik.setFieldValue('recordId', res?.recordId)
      setRecordId(res?.recordId)
    } else {
      toast.success(platformLabels.Updated)
    }
    invalidate()
  }

  const encryptePWD = pwd => {
    var encryptedPWD = SHA1(pwd).toString()
    var shuffledString = ''

    for (let i = 0; i < encryptedPWD.length; i = i + 8) {
      var subString = encryptedPWD.slice(i, i + 8)

      shuffledString += subString.charAt(6) + subString.charAt(7)
      shuffledString += subString.charAt(4) + subString.charAt(5)
      shuffledString += subString.charAt(2) + subString.charAt(3)
      shuffledString += subString.charAt(0) + subString.charAt(1)
    }

    return shuffledString.toUpperCase()
  }

  const invalidate = useInvalidate({
    endpointId: SystemRepository.Users.qry
  })

  const checkFieldDirect = async email => {
    try {
      await getIdentityRequest({
        extension: AccountRepository.UserIdentity.check,
        parameters: `_email=${email}`
      })
      setEmailPresent(false)
      setPasswordState(false)
    } catch (error) {
      if (error.response && error.response.status === 303) {
        setEmailPresent(true)
        setPasswordState(true)
        formik.validateForm()
      } else {
        setEmailPresent(false)
        setPasswordState(false)
      }
    }
  }

  useEffect(() => {
    ;(async function () {
      if (storeRecordId) {
        const res = await getRequest({
          extension: SystemRepository.Users.get,
          parameters: `_recordId=${storeRecordId}`
        })
        formik.setValues(res.record)
        setPasswordState(true)
      }
    })()
  }, [storeRecordId])

  return (
    <FormShell resourceId={ResourceIds.Users} form={formik} maxAccess={maxAccess} editMode={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <CustomTextField
                    name='fullName'
                    label={labels.name}
                    value={formik.values.fullName}
                    required
                    maxAccess={maxAccess}
                    minLength='5'
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('fullName', '')}
                    error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='username'
                    label={labels.username}
                    value={formik.values.username}
                    required
                    maxAccess={maxAccess}
                    minLength='6'
                    maxLength='30'
                    readOnly={editMode}
                    onClear={() => formik.setFieldValue('username', '')}
                    error={formik.touched.username && Boolean(formik.errors.username)}
                    onChange={e => {
                      const inputValue = e.target.value
                      if (/^[a-zA-Z0-9_.-@]*$/.test(inputValue)) {
                        formik.handleChange(e)
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
                    value={formik.values.email}
                    type='email'
                    required
                    placeholder='johndoe@email.com'
                    readOnly={editMode}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('email', '')}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomTextField
                    name='cellPhone'
                    label={labels.cellPhone}
                    value={formik.values.cellPhone}
                    maxAccess={maxAccess}
                    onChange={e => {
                      const inputValue = e.target.value
                      if (/^[0-9]*$/.test(inputValue)) {
                        formik.handleChange(e)
                      }
                    }}
                    onClear={() => formik.setFieldValue('cellPhone', '')}
                    error={formik.touched.cellPhone && Boolean(formik.errors.cellPhone)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    name='activeStatus'
                    label={labels.activeStatus}
                    datasetId={DataSets.ACTIVE_STATUS}
                    values={formik.values}
                    valueField='key'
                    displayField='value'
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('activeStatus', newValue ? newValue?.key : '')
                    }}
                    error={formik.touched.activeStatus && Boolean(formik.errors.activeStatus)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    name='userType'
                    label={labels.userType}
                    datasetId={DataSets.USER_TYPE}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('userType', newValue ? newValue.key : '')
                    }}
                    error={formik.touched.userType && Boolean(formik.errors.userType)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    name='languageId'
                    label={labels.language}
                    valueField='key'
                    displayField='value'
                    datasetId={DataSets.LANGUAGE}
                    values={formik.values}
                    required
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('languageId', newValue ? newValue.key : '')
                    }}
                    error={formik.touched.languageId && Boolean(formik.errors.languageId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    name='platform'
                    label={labels.platform}
                    datasetId={DataSets.PLATFORM}
                    values={formik.values}
                    valueField='key'
                    displayField='value'
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('platform', newValue ? newValue?.key : '')
                    }}
                    error={formik.touched.platform && Boolean(formik.errors.platform)}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={AccessControlRepository.NotificationGroup.qry}
                    parameters='filter='
                    name='notificationGroupId'
                    label={labels.notificationGroup}
                    valueField='recordId'
                    displayField='name'
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    values={formik.values}
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('notificationGroupId', newValue ? newValue.recordId : '')
                    }}
                    error={formik.touched.notificationGroupId && Boolean(formik.errors.notificationGroupId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={EmployeeRepository.Employee.snapshot}
                    parameters={{
                      _startAt: 0,
                      _branchId: 0
                    }}
                    name='employeeId'
                    label={labels.employee}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'firstName', value: 'Name' }
                    ]}
                    valueField='employeeRef'
                    displayField='name'
                    maxAccess={maxAccess}
                    displayFieldWidth={2}
                    form={formik}
                    valueShow='employeeRef'
                    secondValueShow='employeeName'
                    onChange={(event, newValue) => {
                      formik.setFieldValue('employeeId', newValue ? newValue.recordId : '')
                      formik.setFieldValue('employeeRef', newValue ? newValue.reference : '')
                      formik.setFieldValue('employeeName', newValue ? newValue.fullName : '')
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={SaleRepository.SalesPerson.snapshot}
                    name='spId'
                    label={labels.salesPerson}
                    form={formik}
                    displayFieldWidth={2}
                    valueField='spRef'
                    displayField='name'
                    columnsInDropDown={[
                      { key: 'spRef', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    valueShow='spRef'
                    secondValueShow='spName'
                    onChange={(event, newValue) => {
                      formik.setFieldValue('spId', newValue ? newValue.recordId : '')
                      formik.setFieldValue('spRef', newValue ? newValue.spRef : '')
                      formik.setFieldValue('spName', newValue ? newValue.name : '')
                    }}
                    maxAccess={maxAccess}
                  />
                </Grid>

                <FormGrid item hideonempty xs={12}>
                  <CustomTextField
                    name='password'
                    label={labels.password}
                    value={formik.values.password}
                    required
                    hidden={editMode || passwordState}
                    readOnly={passwordState}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('password', '')}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
                  <CustomTextField
                    name='confirmPassword'
                    label={labels.confirmPassword}
                    value={formik.values.confirmPassword}
                    required
                    hidden={editMode || passwordState}
                    readOnly={passwordState}
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    onClear={() => formik.setFieldValue('confirmPassword', '')}
                    error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  />
                </FormGrid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    name='dashboardId'
                    label={labels.dashboard}
                    datasetId={DataSets.DASHBOARD}
                    values={formik.values}
                    valueField='key'
                    displayField='value'
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('dashboardId', newValue ? newValue?.key : '')
                    }}
                    error={formik.touched.dashboardId && Boolean(formik.errors.dashboardId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomCheckBox
                    name='umcpnl'
                    value={formik.values.umcpnl}
                    onChange={event => formik.setFieldValue('umcpnl', event.target.checked)}
                    label={labels.umcpnl}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomCheckBox
                    name='is2FAEnabled'
                    value={formik.values.is2FAEnabled}
                    onChange={e => {
                      formik.setFieldValue('is2FAEnabled', e.target.checked)
                      if (e.target.checked == false) {
                        formik.setFieldValue('otpDevice', '')
                      }
                    }}
                    label={labels.is2FAEnabled}
                    disabled={!editMode}
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    name='otpDevice'
                    label={labels.otpDevice}
                    readOnly={!formik.values.is2FAEnabled}
                    required={formik.values.is2FAEnabled}
                    datasetId={DataSets.OTP_DEVICE}
                    values={formik.values}
                    valueField='key'
                    displayField='value'
                    maxAccess={maxAccess}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('otpDevice', newValue ? newValue?.key : '')
                    }}
                    error={formik.values.is2FAEnabled && formik.touched.otpDevice && Boolean(formik.errors.otpDevice)}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default UsersTab
