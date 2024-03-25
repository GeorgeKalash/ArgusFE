// ** MUI Imports
import { Grid, FormControlLabel, Checkbox, Button, DialogActions } from '@mui/material'

import { useEffect, useState, useContext } from 'react'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useFormik } from 'formik'
import * as yup from 'yup'

// ** Helpers

import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import FormShell from 'src/components/Shared/FormShell'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceIds } from 'src/resources/ResourceIds'

import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { DataSets } from 'src/resources/DataSets'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'

const BenificiaryCash = ({ maxAccess, clientId, dispersalType }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [notArabic, setNotArabic] = useState(true)

  const [initialValues, setInitialData] = useState({
    //RTBEN
    clientId: clientId || '',
    beneficiaryId: 0,
    name: '',
    dispersalType: dispersalType || '',
    nationalityId: null,
    isBlocked: false,
    stoppedDate: null,
    stoppedReason: '',
    gender: null,
    addressLine1: '',
    addressLine2: '',

    //RTBEC
    firstName: '',
    lastName: '',
    middleName: '',
    familyName: '',
    fl_firstName: '',
    fl_lastName: '',
    fl_middleName: '',
    fl_familyName: '',
    countryId: '',
    nationalityId: '',
    cellPhone: '',
    birthDate: null,
    birthPlace: ''
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
      name: yup.string().required(' '),
      firstName: yup.string().required(' '),
      lastName: yup.string().required(' ')
    }),
    onSubmit: async values => {
      const header = {
        clientId: values.clientId,
        beneficiaryId: values.beneficiaryId,
        gender: values.gender,
        name: values.name,
        dispersalType: values.dispersalType,
        isBlocked: values.isBlocked,
        stoppedDate: values.stoppedDate,
        stoppedReason: values.stoppedReason,
        nationalityId: values.nationalityId,
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2
      }

      const cashInfo = {
        clientId: values.clientId,
        beneficiaryId: values.beneficiaryId,
        firstName: values.firstName,
        lastName: values.lastName,
        middleName: values.middleName,
        familyName: values.familyName,
        fl_firstName: values.fl_firstName,
        fl_lastName: values.fl_lastName,
        fl_middleName: values.fl_middleName,
        fl_familyName: values.fl_familyName,
        countryId: values.countryId,
        cellPhone: values.cellPhone,
        nationalityId: values.nationalityId,
        birthDate: values.birthDate,
        birthPlace: values.birthPlace
      }
      const data = { header: header, beneficiaryCash: cashInfo }

      const res = await postRequest({
        extension: RemittanceOutwardsRepository.BeneficiaryCash.set,
        record: JSON.stringify(data)
      })
      if (res.recordId) {
        toast.success('Record Updated Successfully')
      }
    }
  })

  const constructNameField = formValues => {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/
    var name = formValues?.name
    const isArabic = arabicRegex.test(name)
    if (name) {
      const { firstName, middleName, lastName, familyName } = splitName(name)

      if (isArabic) {
        formik.setFieldValue('fl_firstName', firstName)
        formik.setFieldValue('fl_middleName', middleName)
        formik.setFieldValue('fl_lastName', lastName)
        formik.setFieldValue('fl_familyName', familyName)
        formik.setFieldValue('firstName', '')
        formik.setFieldValue('middleName', '')
        formik.setFieldValue('lastName', '')
        formik.setFieldValue('familyName', '')
        setNotArabic(false)
      } else {
        formik.setFieldValue('firstName', firstName)
        formik.setFieldValue('middleName', middleName)
        formik.setFieldValue('lastName', lastName)
        formik.setFieldValue('familyName', familyName)
        formik.setFieldValue('fl_firstName', '')
        formik.setFieldValue('fl_middleName', '')
        formik.setFieldValue('fl_lastName', '')
        formik.setFieldValue('fl_familyName', '')
        setNotArabic(true)
      }
    }
  }

  const splitName = name => {
    const nameParts = name.trim().split(/\s+/) // Split the name by whitespace

    const firstName = nameParts.shift() || ''
    const familyName = nameParts.pop() || ''
    let middleName = ''
    let lastName = ''

    if (nameParts.length > 0) {
      // If there are remaining parts after extracting first and last words
      if (nameParts.length === 1) {
        // If only one remaining part, assign it to middleName
        middleName = nameParts[0]
      } else {
        // Otherwise, split remaining parts into middleName and lastName
        middleName = nameParts.slice(0, -1).join(' ')
        lastName = nameParts.slice(-1)[0]
      }
    }

    return { firstName, middleName, lastName, familyName }
  }

  return (
    <FormShell resourceId={ResourceIds.ClientList} form={formik} maxAccess={maxAccess}>
      <Grid container spacing={4} sx={{ padding: '15px' }}>
        <Grid container xs={12} spacing={2} sx={{ padding: '5px' }}>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={'name'}
              value={formik.values?.name}
              maxLength='50'
              required
              onChange={formik.handleChange}
              onBlur={e => {
                constructNameField(formik.values)
              }}
              error={formik.touched.name && Boolean(formik.errors.name)}
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
              readOnly={notArabic}
              onChange={formik.handleChange}
              maxLength='20'
              onClear={() => formik.setFieldValue('firstName', '')}
              error={formik.touched.firstName && Boolean(formik.errors.firstName)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={3}>
            <CustomTextField
              name='middleName'
              label={'middle'}
              value={formik.values?.middleName}
              readOnly
              onChange={formik.handleChange}
              maxLength='20'
              onClear={() => formik.setFieldValue('middleName', '')}
              error={formik.touched.middleName && Boolean(formik.errors.middleName)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={3}>
            <CustomTextField
              name='lastName'
              label={'last'}
              value={formik.values?.lastName}
              required
              readOnly={notArabic}
              onChange={formik.handleChange}
              maxLength='20'
              onClear={() => formik.setFieldValue('lastName', '')}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={3}>
            <CustomTextField
              name='familyName'
              label={'family'}
              value={formik.values?.familyName}
              readOnly
              onChange={formik.handleChange}
              maxLength='20'
              onClear={() => formik.setFieldValue('familyName', '')}
              error={formik.touched.familyName && Boolean(formik.errors.familyName)}
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
              readOnly
              onChange={formik.handleChange}
              maxLength='20'
              dir='rtl' // Set direction to right-to-left
              onClear={() => formik.setFieldValue('fl_firstName', '')}
              error={formik.touched.fl_firstName && Boolean(formik.errors.fl_firstName)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={3}>
            <CustomTextField
              name='fl_middleName'
              label={'fl_middle'}
              value={formik.values?.fl_middleName}
              readOnly
              maxLength='20'
              onChange={formik.handleChange}
              dir='rtl' // Set direction to right-to-left
              onClear={() => formik.setFieldValue('fl_familyName', '')}
              error={formik.touched.fl_middleName && Boolean(formik.errors.fl_middleName)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={3}>
            <CustomTextField
              name='fl_lastName'
              label={'fl_last'}
              value={formik.values?.fl_lastName}
              readOnly
              onChange={formik.handleChange}
              maxLength='20'
              dir='rtl' // Set direction to right-to-left
              onClear={() => formik.setFieldValue('fl_lastName', '')}
              error={formik.touched.fl_lastName && Boolean(formik.errors.fl_lastName)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={3}>
            <CustomTextField
              name='fl_familyName'
              label={'fl_family'}
              value={formik.values?.fl_familyName}
              readOnly
              maxLength='20'
              onChange={formik.handleChange}
              dir='rtl' // Set direction to right-to-left
              onClear={() => formik.setFieldValue('fl_familyName', '')}
              error={formik.touched.fl_familyName && Boolean(formik.errors.fl_familyName)}
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
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={SystemRepository.Country.qry}
              name='nationalityId'
              label={'Country'}
              valueField='recordId'
              displayField={['reference', 'name', 'flName']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' },
                { key: 'flName', value: 'Foreign Language Name' }
              ]}
              values={formik.values}
              displayFieldWidth={1.25}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('nationalityId', newValue?.recordId)
                } else {
                  formik.setFieldValue('nationalityId', '')
                }
              }}
              error={formik.touched.countryId && Boolean(formik.errors.countryId)}
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
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='addressLine1'
              label='Address 1'
              value={formik.values.addressLine1}
              rows={3}
              maxLength='100'
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('addressLine1', '')}
              error={formik.touched.addressLine1 && Boolean(formik.errors.addressLine1)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='addressLine2'
              label='Address 2'
              value={formik.values.addressLine2}
              rows={3}
              maxLength='100'
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('addressLine2', '')}
              error={formik.touched.addressLine2 && Boolean(formik.errors.addressLine2)}
            />
          </Grid>
        </Grid>
        <Grid container xs={6} spacing={2} sx={{ padding: '5px' }}>
          <Grid item xs={12}>
            <CustomDatePicker
              name='birthDate'
              label={'birthDate'}
              value={formik.values?.birthDate}
              onChange={formik.setFieldValue}
              disabledDate={'>='}
              onClear={() => formik.setFieldValue('birthDate', '')}
              error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.GENDER}
              name='gender'
              label='Gender'
              valueField='key'
              displayField='value'
              values={formik.values}
              onChange={formik.handleChange}
              error={formik.touched.gender && Boolean(formik.errors.gender)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={SystemRepository.Country.qry}
              name='nationalityId'
              label={'Nationality'}
              valueField='recordId'
              displayField={['reference', 'name', 'flName']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' },
                { key: 'flName', value: 'Foreign Language Name' }
              ]}
              displayFieldWidth={1.25}
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('nationalityId', newValue?.recordId)
                } else {
                  formik.setFieldValue('nationalityId', '')
                }
              }}
              error={formik.touched.countryId && Boolean(formik.errors.countryId)}
              maxAccess={maxAccess}
            />
          </Grid>
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
              error={formik.touched.stopReason && Boolean(formik.errors.stopReason)}
            />
          </Grid>
        </Grid>
      </Grid>
    </FormShell>
  )
}

export default BenificiaryCash
