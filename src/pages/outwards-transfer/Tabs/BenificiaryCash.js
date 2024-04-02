// ** MUI Imports
import { Grid, FormControlLabel, Checkbox, Button, DialogActions } from '@mui/material'

import { useEffect, useState, useContext } from 'react'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useFormik } from 'formik'
import * as yup from 'yup'

// ** Helpers
import { formatDateFromApi } from 'src/lib/date-helper'
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
import { useResourceQuery } from 'src/hooks/resource'

const BenificiaryCash = ({ clientId, dispersalType, beneficiaryId }) => {
  useEffect(() => {
    ;(async function () {
      if (beneficiaryId) {
        const RTBEC = await getRequest({
          extension: RemittanceOutwardsRepository.BeneficiaryCash.get,
          parameters: `_clientId=${clientId}&_beneficiaryId=${beneficiaryId}`
        })

        const RTBEN = await getRequest({
          extension: RemittanceOutwardsRepository.Beneficiary.get,
          parameters: `_clientId=${clientId}&_beneficiaryId=${beneficiaryId}`
        })

        const obj = {
          //RTBEN
          clientId: clientId,
          recordId: clientId * 1000 + beneficiaryId,
          beneficiaryId: beneficiaryId,
          name: RTBEN?.record?.name,
          dispersalType: dispersalType,
          nationalityId: RTBEN?.record?.nationalityId,
          isBlocked: RTBEN?.record?.isBlocked,
          stoppedDate: RTBEN?.record?.stoppedDate && formatDateFromApi(RTBEN.record.stoppedDate),
          stoppedReason: RTBEN?.record?.stoppedReason,
          gender: RTBEN?.record?.gender,
          addressLine1: RTBEN?.record?.addressLine1,
          addressLine2: RTBEN?.record?.addressLine2,

          //RTBEC
          firstName: RTBEC?.record?.firstName,
          lastName: RTBEC?.record?.lastName,
          middleName: RTBEC?.record?.middleName,
          familyName: RTBEC?.record?.familyName,
          fl_firstName: RTBEC?.record?.fl_firstName,
          fl_lastName: RTBEC?.record?.fl_lastName,
          fl_middleName: RTBEC?.record?.fl_middleName,
          fl_familyName: RTBEC?.record?.fl_familyName,
          countryId: RTBEC?.record?.countryId,
          nationalityId: RTBEC?.record?.nationalityId,
          cellPhone: RTBEC?.record?.cellPhone,
          birthDate: RTBEC?.record?.birthDate && formatDateFromApi(RTBEC.record.birthDate),
          birthPlace: RTBEC?.record?.birthPlace
        }
        formik.setValues(obj)
      }
    })()
  }, [])

  const { getRequest, postRequest } = useContext(RequestsContext)
  const [notArabic, setNotArabic] = useState(true)

  const { labels: _labels, access } = useResourceQuery({
    datasetId: ResourceIds.BeneficiaryCash
  })

  const [initialValues, setInitialData] = useState({
    //RTBEN
    clientId: clientId || '',
    recordId: '',
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
    <FormShell
      resourceId={ResourceIds.BeneficiaryCash}
      form={formik}
      editMode={formik?.values?.beneficiaryId}
      maxAccess={access}
    >
      <Grid container spacing={4} sx={{ padding: '15px' }}>
        <Grid container xs={12} spacing={2} sx={{ padding: '5px' }}>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={_labels.name}
              value={formik.values?.name}
              maxLength='50'
              required
              onChange={formik.handleChange}
              onBlur={e => {
                constructNameField(formik.values)
              }}
              error={formik.touched.name && Boolean(formik.errors.name)}
              maxAccess={access}
            />
          </Grid>
        </Grid>
        <Grid container xs={12} spacing={2} sx={{ padding: '5px' }}>
          <Grid item xs={3}>
            <CustomTextField
              name='firstName'
              label={_labels.firstName}
              value={formik.values?.firstName}
              required
              readOnly={notArabic}
              onChange={formik.handleChange}
              maxLength='20'
              onClear={() => formik.setFieldValue('firstName', '')}
              error={formik.touched.firstName && Boolean(formik.errors.firstName)}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={3}>
            <CustomTextField
              name='middleName'
              label={_labels.middleName}
              value={formik.values?.middleName}
              readOnly
              onChange={formik.handleChange}
              maxLength='20'
              onClear={() => formik.setFieldValue('middleName', '')}
              error={formik.touched.middleName && Boolean(formik.errors.middleName)}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={3}>
            <CustomTextField
              name='lastName'
              label={_labels.lastName}
              value={formik.values?.lastName}
              required
              readOnly={notArabic}
              onChange={formik.handleChange}
              maxLength='20'
              onClear={() => formik.setFieldValue('lastName', '')}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={3}>
            <CustomTextField
              name='familyName'
              label={_labels.familyName}
              value={formik.values?.familyName}
              readOnly
              onChange={formik.handleChange}
              maxLength='20'
              onClear={() => formik.setFieldValue('familyName', '')}
              error={formik.touched.familyName && Boolean(formik.errors.familyName)}
              maxAccess={access}
            />
          </Grid>
        </Grid>

        <Grid container xs={12} spacing={2} sx={{ flexDirection: 'row-reverse', padding: '5px' }}>
          <Grid item xs={3}>
            <CustomTextField
              name='fl_firstName'
              label={_labels.flFirstName}
              value={formik.values?.fl_firstName}
              readOnly
              onChange={formik.handleChange}
              maxLength='20'
              dir='rtl' // Set direction to right-to-left
              onClear={() => formik.setFieldValue('fl_firstName', '')}
              error={formik.touched.fl_firstName && Boolean(formik.errors.fl_firstName)}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={3}>
            <CustomTextField
              name='fl_middleName'
              label={_labels.flMiddleName}
              value={formik.values?.fl_middleName}
              readOnly
              maxLength='20'
              onChange={formik.handleChange}
              dir='rtl' // Set direction to right-to-left
              onClear={() => formik.setFieldValue('fl_familyName', '')}
              error={formik.touched.fl_middleName && Boolean(formik.errors.fl_middleName)}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={3}>
            <CustomTextField
              name='fl_lastName'
              label={_labels.flLastName}
              value={formik.values?.fl_lastName}
              readOnly
              onChange={formik.handleChange}
              maxLength='20'
              dir='rtl' // Set direction to right-to-left
              onClear={() => formik.setFieldValue('fl_lastName', '')}
              error={formik.touched.fl_lastName && Boolean(formik.errors.fl_lastName)}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={3}>
            <CustomTextField
              name='fl_familyName'
              label={_labels.flFamilyName}
              value={formik.values?.fl_familyName}
              readOnly
              maxLength='20'
              maxAccess={access}
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
              label={_labels.cellPhone}
              value={formik.values?.cellPhone}
              onChange={formik.handleChange}
              maxLength='20'
              onClear={() => formik.setFieldValue('cellPhone', '')}
              error={formik.touched.cellPhone && Boolean(formik.errors.cellPhone)}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={SystemRepository.Country.qry}
              name='nationalityId'
              label={_labels.country}
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
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='birthPlace'
              label={_labels.birthPlace}
              value={formik.values?.birthPlace}
              onChange={formik.handleChange}
              maxLength='50'
              onClear={() => formik.setFieldValue('birthPlace', '')}
              error={formik.touched.birthPlace && Boolean(formik.errors.birthPlace)}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='addressLine1'
              label={_labels.addressLine1}
              value={formik.values.addressLine1}
              rows={3}
              maxLength='100'
              maxAccess={access}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('addressLine1', '')}
              error={formik.touched.addressLine1 && Boolean(formik.errors.addressLine1)}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='addressLine2'
              label={_labels.addressLine2}
              value={formik.values.addressLine2}
              rows={3}
              maxLength='100'
              maxAccess={access}
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
              label={_labels.birthDate}
              value={formik.values?.birthDate}
              onChange={formik.setFieldValue}
              disabledDate={'>='}
              onClear={() => formik.setFieldValue('birthDate', '')}
              error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              datasetId={DataSets.GENDER}
              name='gender'
              label={_labels.gender}
              valueField='key'
              displayField='value'
              values={formik.values}
              onChange={formik.handleChange}
              maxAccess={access}
              error={formik.touched.gender && Boolean(formik.errors.gender)}
            />
          </Grid>
          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={SystemRepository.Country.qry}
              name='nationalityId'
              label={_labels.nationality}
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
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={12} sx={{ position: 'relative', width: '100%' }}>
            <FormControlLabel
              control={<Checkbox name='isBlocked' disabled={true} checked={formik.values?.isBlocked} />}
              label={_labels.isBlocked}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomDatePicker
              name='stoppedDate'
              label={_labels.stoppedDate}
              value={formik.values?.stoppedDate}
              readOnly={true}
              error={formik.touched.stoppedDate && Boolean(formik.errors.stoppedDate)}
              maxAccess={access}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='stoppedReason'
              label={_labels.stoppedReason}
              readOnly
              value={formik.values.stoppedReason}
              rows={3}
              error={formik.touched.stoppedReason && Boolean(formik.errors.stoppedReason)}
            />
          </Grid>
        </Grid>
      </Grid>
    </FormShell>
  )
}

export default BenificiaryCash
