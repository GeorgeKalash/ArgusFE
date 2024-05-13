// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomLookup from 'src/components/Inputs/CustomLookup'

// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** React Imports
import { useState } from 'react'

const UsersTab = ({
  labels,
  usersValidation,
  maxAccess,
  notificationGrpStore,
  languageStore,
  userTypeStore,
  activeStatusStore,
  employeeStore,
  setEmployeeStore,
  lookupEmployee,
  editMode,
  checkFieldDirect,
  emailPresent,
  passwordState,
  setPasswordState
}) => {
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
