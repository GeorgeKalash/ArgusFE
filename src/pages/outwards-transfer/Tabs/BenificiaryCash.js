// ** MUI Imports
import { Grid, FormControlLabel, Checkbox, Button, DialogActions } from '@mui/material'

import { useEffect, useState, useContext } from 'react'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useFormik } from 'formik'
import * as yup from 'yup'

// ** Helpers
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
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
import { useForm } from 'src/hooks/form'
import FormGrid from 'src/components/form/layout/FormGrid'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'

const BenificiaryCash = ({ clientId, dispersalType, beneficiaryId, corId, countryId }) => {
  const [maxAccess, setMaxAccess] = useState(null)

  useEffect(() => {
    ;(async function () {
      if (countryId || corId || dispersalType) {
        const qryCCL = await getRequest({
          extension: RemittanceSettingsRepository.CorrespondentControl.qry,
          parameters: `_countryId=${countryId}&_corId=${corId}&_resourceId=${ResourceIds.BeneficiaryCash}`
        })

        const controls = { controls: qryCCL.list }
        const maxAccess = { record: controls }
        setMaxAccess(maxAccess)
      }

      if (beneficiaryId) {
        const RTBEC = await getRequest({
          extension: RemittanceOutwardsRepository.BeneficiaryCash.get,
          parameters: `_clientId=${clientId}&_beneficiaryId=${beneficiaryId}`
        })

        const RTBEN = await getRequest({
          extension: RemittanceOutwardsRepository.Beneficiary.get,
          parameters: `_clientId=${clientId}&_beneficiaryId=${beneficiaryId}`
        })

        if (!RTBEC?.record?.firstName) setNotArabic(false)

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
          cobId: RTBEN?.record?.cobId,
          cellPhone: RTBEN?.record?.cellPhone,
          rtId: RTBEN?.record?.rtId,
          rtName: RTBEN?.record?.rtName,
          birthDate: RTBEN?.record?.birthDate && formatDateFromApi(RTBEN.record.birthDate),
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
          birthPlace: RTBEC?.record?.birthPlace
        }
        formik.setValues(obj)
      }
    })()
  }, [])

  const { getRequest, postRequest } = useContext(RequestsContext)
  const [notArabic, setNotArabic] = useState(true)

  const { labels: _labels } = useResourceQuery({
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
    cobId: '',
    rtName: '',
    rtId: null,
    cellPhone: '',
    birthDate: null,
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
    birthPlace: ''
  })

  const { formik } = useForm({
    maxAccess,
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
        stoppedDate: values.stoppedDate ? formatDateToApi(values.stoppedDate) : null,
        stoppedReason: values.stoppedReason,
        nationalityId: values.nationalityId,
        cobId: values.cobId,
        rtId: values.rtId,
        rtName: values.rtName,
        birthDate: values.birthDate ? formatDateToApi(values.birthDate) : null,
        cellPhone: values.cellPhone,
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
    console.log('firessssss')
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
      maxAccess={maxAccess}
    >
      <Grid container rowGap={2}>
        <Grid container xs={12}>
          <FormGrid hideonempty xs={12}>
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
              maxAccess={maxAccess}
            />
          </FormGrid>
        </Grid>
        <Grid container xs={12} spacing={2}>
          <FormGrid item hideonempty xs={3}>
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
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid item hideonempty xs={3}>
            <CustomTextField
              name='middleName'
              label={_labels.middleName}
              value={formik.values?.middleName}
              readOnly
              onChange={formik.handleChange}
              maxLength='20'
              onClear={() => formik.setFieldValue('middleName', '')}
              error={formik.touched.middleName && Boolean(formik.errors.middleName)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid item hideonempty xs={3}>
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
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid item hideonempty xs={3}>
            <CustomTextField
              name='familyName'
              label={_labels.familyName}
              value={formik.values?.familyName}
              readOnly
              onChange={formik.handleChange}
              maxLength='20'
              onClear={() => formik.setFieldValue('familyName', '')}
              error={formik.touched.familyName && Boolean(formik.errors.familyName)}
              maxAccess={maxAccess}
            />
          </FormGrid>
        </Grid>

        <Grid container xs={12} spacing={2} sx={{ flexDirection: 'row-reverse', pt: 2, pl: '10px' }}>
          <FormGrid hideonempty xs={3}>
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
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid hideonempty xs={3}>
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
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid hideonempty xs={3}>
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
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid hideonempty xs={3}>
            <CustomTextField
              name='fl_familyName'
              label={_labels.flFamilyName}
              value={formik.values?.fl_familyName}
              readOnly
              maxLength='20'
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              dir='rtl' // Set direction to right-to-left
              onClear={() => formik.setFieldValue('fl_familyName', '')}
              error={formik.touched.fl_familyName && Boolean(formik.errors.fl_familyName)}
            />
          </FormGrid>
        </Grid>
        <Grid container rowGap={2} xs={6} spacing={2} sx={{ px: 2, pt: 2 }}>
          <FormGrid hideonempty xs={12} sx={{ position: 'relative', width: '100%' }}>
            <CustomTextField
              name='cellPhone'
              phone={true}
              label={_labels.cellPhone}
              value={formik.values?.cellPhone}
              onChange={formik.handleChange}
              maxLength='20'
              onClear={() => formik.setFieldValue('cellPhone', '')}
              error={formik.touched.cellPhone && Boolean(formik.errors.cellPhone)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
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
              error={formik.touched.nationalityId && Boolean(formik.errors.nationalityId)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <ResourceComboBox
              endpointId={SystemRepository.Country.qry}
              name='cobId'
              label={_labels.countryOfBirth}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('cobId', newValue ? newValue.recordId : '')
              }}
              error={formik.touched.cobId && Boolean(formik.errors.cobId)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <CustomTextField
              name='birthPlace'
              label={_labels.birthPlace}
              value={formik.values?.birthPlace}
              onChange={formik.handleChange}
              maxLength='50'
              onClear={() => formik.setFieldValue('birthPlace', '')}
              error={formik.touched.birthPlace && Boolean(formik.errors.birthPlace)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <CustomTextArea
              name='addressLine1'
              label={_labels.addressLine1}
              value={formik.values.addressLine1}
              rows={3}
              maxLength='100'
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('addressLine1', '')}
              error={formik.touched.addressLine1 && Boolean(formik.errors.addressLine1)}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <CustomTextArea
              name='addressLine2'
              label={_labels.addressLine2}
              value={formik.values.addressLine2}
              rows={3}
              maxLength='100'
              maxAccess={maxAccess}
              onChange={formik.handleChange}
              onClear={() => formik.setFieldValue('addressLine2', '')}
              error={formik.touched.addressLine2 && Boolean(formik.errors.addressLine2)}
            />
          </FormGrid>
        </Grid>
        <Grid container rowGap={2} xs={6} spacing={2} sx={{ px: 2, pt: 2 }}>
          <FormGrid hideonempty xs={12}>
            <CustomDatePicker
              name='birthDate'
              label={_labels.birthDate}
              value={formik.values?.birthDate}
              onChange={formik.setFieldValue}
              disabledDate={'>='}
              onClear={() => formik.setFieldValue('birthDate', '')}
              error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <ResourceComboBox
              datasetId={DataSets.GENDER}
              name='gender'
              label={_labels.gender}
              valueField='key'
              displayField='value'
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('gender', newValue ? newValue.key : '')
              }}
              maxAccess={maxAccess}
              error={formik.touched.gender && Boolean(formik.errors.gender)}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={CurrencyTradingSettingsRepository.RelationType.qry}
                name='rtId'
                label={_labels.relationType}
                displayField='name'
                valueField='recordId'
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('rtId', newValue ? newValue?.recordId : '')
                }}
                error={formik.touched.rtId && Boolean(formik.errors.rtId)}
              />
            </Grid>
          </FormGrid>
          <FormGrid hideonempty xs={12}>
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
              error={formik.touched.nationalityId && Boolean(formik.errors.nationalityId)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12} sx={{ position: 'relative', width: '100%' }}>
            <FormControlLabel
              control={<Checkbox name='isBlocked' disabled={true} checked={formik.values?.isBlocked} />}
              label={_labels.isBlocked}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <CustomDatePicker
              name='stoppedDate'
              label={_labels.stoppedDate}
              value={formik.values?.stoppedDate}
              readOnly={true}
              error={formik.touched.stoppedDate && Boolean(formik.errors.stoppedDate)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
            <CustomTextArea
              name='stoppedReason'
              label={_labels.stoppedReason}
              readOnly
              value={formik.values.stoppedReason}
              rows={3}
              error={formik.touched.stoppedReason && Boolean(formik.errors.stoppedReason)}
            />
          </FormGrid>
        </Grid>
      </Grid>
    </FormShell>
  )
}

export default BenificiaryCash
