// ** MUI Imports
import { Grid, FormControlLabel, Checkbox, Button, DialogActions } from '@mui/material'

import { useEffect, useState, useContext } from 'react'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Helpers

import AddressTab from 'src/components/Shared/AddressTab'
import FieldSet from 'src/components/Shared/FieldSet'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { TextFieldReference } from 'src/components/Shared/TextFieldReference'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import UseIdType from 'src/hooks/useIdType'
import FormShell from 'src/components/Shared/FormShell'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

import { DataSets } from 'src/resources/DataSets'
import { RequestsContext } from 'src/providers/RequestsContext'
import OTPPhoneVerification from 'src/components/Shared/OTPPhoneVerification'
import { formatDateToApi, formatDateToApiFunction, formatDateFromApi } from 'src/lib/date-helper'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import { useWindow } from 'src/windows'
import Confirmation from 'src/components/Shared/Confirmation'
import { AddressFormShell } from 'src/components/Shared/AddressFormShell'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'

const BenificiaryCash = ({ maxAccess }) => {
  const [initialValues, setInitialData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    familyName: '',
    fl_firstName: '',
    fl_lastName: '',
    fl_middleName: '',
    fl_familyName: ''
  })

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    validate: values => {
      const errors = {}

      return errors
    },
    validationSchema: yup.object({
      firstName: yup.string().required('This field is required'),
      lastName: yup.string().required('This field is required'),
      fl_firstName: yup.string().required('This field is required'),
      fl_lastName: yup.string().required('This field is required')
    }),
    onSubmit: values => {}
  })

  return (
    <FormShell resourceId={ResourceIds.ClientList} form={formik} maxAccess={maxAccess}>
      <Grid container spacing={4} sx={{ padding: '15px' }}>
        <Grid container xs={12} spacing={2} sx={{ padding: '5px' }}>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={'name'}
              value={formik.values?.name}
              maxLength='80'
              readOnly
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              maxAccess={maxAccess}
            />
          </Grid>
        </Grid>
        <Grid container xs={12} spacing={2} sx={{ padding: '5px' }}>
          <Grid item xs={3}>
            <CustomTextField
              name='firstName'
              label={'first'}
              value={formik.values?.firstName}
              required
              onChange={formik.handleChange}
              maxLength='20'
              onClear={() => formik.setFieldValue('firstName', '')}
              error={formik.touched.firstName && Boolean(formik.errors.firstName)}
              helperText={formik.touched.firstName && formik.errors.firstName}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={3}>
            <CustomTextField
              name='middleName'
              label={'middle'}
              value={formik.values?.middleName}
              onChange={formik.handleChange}
              maxLength='20'
              onClear={() => formik.setFieldValue('middleName', '')}
              error={formik.touched.middleName && Boolean(formik.errors.middleName)}
              helperText={formik.touched.middleName && formik.errors.middleName}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={3}>
            <CustomTextField
              name='lastName'
              label={'last'}
              value={formik.values?.lastName}
              required
              onChange={formik.handleChange}
              maxLength='20'
              onClear={() => formik.setFieldValue('lastName', '')}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={3}>
            <CustomTextField
              name='familyName'
              label={'family'}
              value={formik.values?.familyName}
              onChange={formik.handleChange}
              maxLength='20'
              onClear={() => formik.setFieldValue('familyName', '')}
              error={formik.touched.familyName && Boolean(formik.errors.familyName)}
              helperText={formik.touched.familyName && formik.errors.familyName}
              maxAccess={maxAccess}
            />
          </Grid>
        </Grid>

        <Grid container xs={12} spacing={2} sx={{ flexDirection: 'row-reverse', padding: '5px' }}>
          <Grid item xs={3}>
            <CustomTextField
              name='fl_firstName'
              label={'fl_first'}
              value={formik.values?.fl_firstName}
              onChange={formik.handleChange}
              maxLength='20'
              dir='rtl' // Set direction to right-to-left
              onClear={() => formik.setFieldValue('fl_firstName', '')}
              error={formik.touched.fl_firstName && Boolean(formik.errors.fl_firstName)}
              helperText={formik.touched.fl_firstName && formik.errors.fl_firstName}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={3}>
            <CustomTextField
              name='fl_middleName'
              label={'fl_middle'}
              value={formik.values?.fl_middleName}
              onChange={formik.handleChange}
              dir='rtl' // Set direction to right-to-left
              onClear={() => formik.setFieldValue('fl_familyName', '')}
              error={formik.touched.fl_middleName && Boolean(formik.errors.fl_middleName)}
              helperText={formik.touched.fl_middleName && formik.errors.fl_middleName}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={3}>
            <CustomTextField
              name='fl_lastName'
              label={'fl_last'}
              value={formik.values?.fl_lastName}
              onChange={formik.handleChange}
              maxLength='20'
              dir='rtl' // Set direction to right-to-left
              onClear={() => formik.setFieldValue('fl_lastName', '')}
              error={formik.touched.fl_lastName && Boolean(formik.errors.fl_lastName)}
              helperText={formik.touched.fl_lastName && formik.errors.fl_lastName}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={3}>
            <CustomTextField
              name='fl_familyName'
              label={'fl_family'}
              value={formik.values?.fl_familyName}
              onChange={formik.handleChange}
              dir='rtl' // Set direction to right-to-left
              onClear={() => formik.setFieldValue('fl_familyName', '')}
              error={formik.touched.fl_familyName && Boolean(formik.errors.fl_familyName)}
              helperText={formik.touched.fl_familyName && formik.errors.fl_familyName}
            />
          </Grid>
        </Grid>
        <Grid container xs={6} spacing={2} sx={{ padding: '5px' }}>
          <Grid item xs={12} sx={{ position: 'relative', width: '100%' }}>
            <CustomTextField
              name='cellPhone'
              phone={true}
              label={'cellPhone'}
              value={formik.values?.cellPhone}
              onChange={formik.handleChange}
              maxLength='20'
              onClear={() => formik.setFieldValue('cellPhone', '')}
              error={formik.touched.cellPhone && Boolean(formik.errors.cellPhone)}
              helperText={formik.touched.cellPhone && formik.errors.cellPhone}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomDatePicker
              name='birthDate'
              label={'birthDate'}
              value={formik.values?.birthDate}
              required={true}
              onChange={formik.setFieldValue}
              disabledDate={'>='}
              onClear={() => formik.setFieldValue('birthDate', '')}
              error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
              helperText={formik.touched.birthDate && formik.errors.birthDate}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={SystemRepository.Country.qry}
              name='countryId'
              label={'Country'}
              valueField='recordId'
              displayField={['reference', 'name', 'flName']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' },
                { key: 'flName', value: 'Foreign Language Name' }
              ]}
              values={formik.values}
              required
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('countryId', newValue?.recordId)

                  formik.setFieldValue('idCity', '')
                } else {
                  formik.setFieldValue('countryId', '')

                  formik.setFieldValue('idCity', '')
                }
              }}
              error={formik.touched.idCountry && Boolean(formik.errors.idCountry)}
              helperText={formik.touched.idCountry && formik.errors.idCountry}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='birthPlace'
              label={'birthPlace'}
              value={formik.values?.birthPlace}
              onChange={formik.handleChange}
              maxLength='50'
              onClear={() => formik.setFieldValue('birthPlace', '')}
              error={formik.touched.birthPlace && Boolean(formik.errors.birthPlace)}
              helperText={formik.touched.birthPlace && formik.errors.birthPlace}
              maxAccess={maxAccess}
            />
          </Grid>
        </Grid>
        <Grid container xs={6} spacing={2} sx={{ padding: '5px' }}>
          <Grid item xs={12} sx={{ position: 'relative', width: '100%' }}>
            <FormControlLabel
              control={<Checkbox name='isBlocked' disabled={true} checked={formik.values?.isBlocked} />}
              label={'isBlocked'}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomDatePicker
              name='stopDate'
              label={'stopDate'}
              value={formik.values?.stopDate}
              readOnly={true}
              error={formik.touched.stopDate && Boolean(formik.errors.stopDate)}
              helperText={formik.touched.stopDate && formik.errors.stopDate}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='stopReason'
              label='Stop Reason'
              readOnly
              value={formik.values.stopReason}
              rows={3}
              maxLength='150' //maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('stopReason', '')}
              error={formik.touched.stopReason && Boolean(formik.errors.stopReason)}
              helperText={formik.touched.stopReason && formik.errors.stopReason}
            />
          </Grid>
        </Grid>
      </Grid>
    </FormShell>
  )
}

export default BenificiaryCash
