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

const UsersTab = ({ labels, maxAccess, storeRecordId, setRecordId }) => {
  const [emailPresent, setEmailPresent] = useState(false)
  const [passwordState, setPasswordState] = useState(false)
  const { getRequest, postRequest, getIdentityRequest } = useContext(RequestsContext)
  const editMode = !!storeRecordId

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: storeRecordId || null,
      fullName: '',
      username: '',
      email: '',
      cellPhone: '',
      activeStatus: '',
      userType: '',
      languageId: '',
      notificationGroupId: '',
      employeeId: '',
      password: '',
      confirmPassword: '',
      umcpnl: ''
    },

    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      fullName: yup.string().required('This field is required'),
      username: yup.string().required('This field is required'),
      email: yup.string().required('This field is required'),
      activeStatus: yup.string().required('This field is required'),
      userType: yup.string().required('This field is required'),
      languageId: yup.string().required('This field is required'),
      ...(passwordState
        ? {}
        : {
            password: yup.string().required('This field is required'),
            confirmPassword: yup.string().required('This field is required')
          })
    }),
    onSubmit: async obj => {
      await postRequest({
        extension: SystemRepository.Users.set,
        record: JSON.stringify(obj)
      })
      formik.setFieldValue('recordId', res.recordId)
      setRecordId(res.recordId)
      if (!obj.recordId) toast.success('Record Added Successfully')
      else toast.success('Record Edited Successfully')
    }
  })

  const checkFieldDirect = email => {
    getIdentityRequest({
      extension: AccountRepository.UserIdentity.check,
      parameters: `_email=${email}`
    })
      .then(res => {
        setEmailPresent(false)
        setPasswordState(false)
        formik.validateForm()
      })
      .catch(error => {
        setErrorMessage(error)
        if (error.response.status == 300) {
          setEmailPresent(true)
          setPasswordState(true)
          formik.validateForm()
        } else {
          setEmailPresent(false)
          setPasswordState(false)
          formik.validateForm()
        }
      })
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
          <Grid container>
            {/* First Column */}
            <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
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
            </Grid>
            <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
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
                    _size: 50,
                    _startAt: 0,
                    _branchId: 0
                  }}
                  name='employeeId'
                  label={labels.employee}
                  valueField='reference'
                  displayField='name'
                  maxAccess={maxAccess}
                  form={formik}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('employeeId', newValue ? newValue.recordId : '')
                    formik.setFieldValue('employeeRef', newValue ? newValue.reference : '')
                    formik.setFieldValue('employeeName', newValue ? newValue.name : '')
                  }}
                  error={formik.touched.employeeId && Boolean(formik.errors.employeeId)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='password'
                  label={labels.password}
                  value={formik.values.password}
                  required
                  hidden={editMode}
                  readOnly={passwordState}
                  maxAccess={maxAccess}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('password', '')}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='confirmPassword'
                  label={labels.confirmPassword}
                  value={formik.values.confirmPassword}
                  required
                  hidden={editMode}
                  readOnly={passwordState}
                  maxAccess={maxAccess}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('confirmPassword', '')}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name='umcpnl'
                      maxAccess={maxAccess}
                      checked={formik.values?.umcpnl}
                      onChange={formik.handleChange}
                    />
                  }
                  label={labels.umcpnl}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}

export default UsersTab
