import { Grid } from '@mui/material'
import { useEffect, useState, useContext, useRef } from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import * as yup from 'yup'
import { useError } from 'src/error'
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
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import FormGrid from 'src/components/form/layout/FormGrid'
import { HIDDEN } from 'src/services/api/maxAccess'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import CustomCheckBox from '../Inputs/CustomCheckBox'
import { Fixed } from './Layouts/Fixed'
import { ControlContext } from 'src/providers/ControlContext'
import useSetWindow from 'src/hooks/useSetWindow'

const BenificiaryCashForm = ({
  viewBtns = true,
  client,
  dispersalType,
  beneficiary,
  submitted,
  setSubmitted,
  corId,
  currencyId,
  countryId,
  resetForm,
  setResetForm,
  onChange,
  setValidSubmit,
  onSuccess,
  submitMainForm = true,
  recordId,
  forceDisable,
  forceEdit = null,
  window
}) => {
  const [maxAccess, setMaxAccess] = useState({ record: [] })
  const { stack: stackError } = useError()
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [notArabic, setNotArabic] = useState(true)
  const hiddenIsInActive = useRef(false)
  const hiddenIsBlocked = useRef(false)
  const { platformLabels } = useContext(ControlContext)

  useSetWindow({ title: platformLabels.cash, window })

  const initialValues = {
    //RTBEN
    clientId: client?.clientId || '',
    recordId,
    beneficiaryId: 0,
    name: '',
    dispersalType: dispersalType || '',
    nationalityId: null,
    isBlocked: false,
    isInactive: false,
    stoppedDate: null,
    stoppedReason: '',
    gender: null,
    rtName: '',
    rtId: null,
    cobId: '',
    cellPhone: '',
    birthDate: null,
    currencyId: currencyId || null,
    addressLine1: '',
    addressLine2: '',
    clientRef: client?.clientRef || '',
    clientName: client?.clientName || '',
    countryId: countryId || '',
    seqNo: 1,

    //RTBEC
    firstName: '',
    lastName: '',
    middleName: '',
    familyName: '',
    fl_firstName: '',
    fl_lastName: '',
    fl_middleName: '',
    fl_familyName: '',
    birthPlace: '',
    seqNo: 1
  }

  const { formik } = useForm({
    maxAccess,
    initialValues,
    validationSchema: yup.object({
      clientId: yup.string().required(),
      countryId: yup.string().required(),
      name: yup.string().required(),
      firstName: yup.string().required(),
      lastName: yup.string().required(),
      currencyId: yup.string().required()
    }),
    onSubmit: async values => {
      if (submitMainForm) {
        const header = {
          clientId: values.clientId,
          beneficiaryId: values.beneficiaryId,
          gender: values.gender,
          name: values.name,
          rtId: values.rtId,
          dispersalType: values.dispersalType,
          isBlocked: values.isBlocked,
          isInactive: values.isInactive,
          stoppedDate: values.stoppedDate ? formatDateToApi(values.stoppedDate) : null,
          stoppedReason: values.stoppedReason,
          nationalityId: values.nationalityId,
          cobId: values.cobId,
          birthDate: values.birthDate ? formatDateToApi(values.birthDate) : null,
          currencyId: values.currencyId,
          cellPhone: values.cellPhone,
          addressLine1: values.addressLine1,
          addressLine2: values.addressLine2,
          clientRef: values.clientRef,
          clientName: values.clientName,
          countryId: values.countryId,
          seqNo: values.seqNo
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
          birthPlace: values.birthPlace,
          seqNo: values.seqNo
        }
        const data = { header: header, beneficiaryCash: cashInfo }

        const res = await postRequest({
          extension: RemittanceOutwardsRepository.BeneficiaryCash.set,
          record: JSON.stringify(data)
        })

        toast.success(platformLabels.Added)

        const [clientId, beneficiaryId, seqNo] = res.recordId.split(',')

        formik.setFieldValue('recordId', (clientId * 100).toString() + (beneficiaryId * 10).toString() + seqNo)

        if (onSuccess) onSuccess(res.recordId, values)
      }
    }
  })

  const editMode = forceEdit == null ? !!formik.values.recordId : forceEdit

  const { labels: _labels } = useResourceQuery({
    datasetId: ResourceIds.BeneficiaryCash
  })
  useEffect(() => {
    ;(async function () {
      if (formik.values.countryId && dispersalType) {
        const qryCCL = await getRequest({
          extension: RemittanceSettingsRepository.CorrespondentControl.qry,
          parameters: `_countryId=${formik.values.countryId}&_corId=${corId || 0}&_resourceId=${
            ResourceIds.BeneficiaryCash
          }`
        })

        const controls = { controls: qryCCL.list }
        const maxAccess = { record: controls }
        setMaxAccess(maxAccess)

        const isInActiveAccessLevel = (maxAccess?.record?.controls ?? []).find(
          ({ controlId }) => controlId === 'isInactive'
        )

        const isBlockedAccessLevel = (maxAccess?.record?.controls ?? []).find(
          ({ controlId }) => controlId === 'isBlocked'
        )

        hiddenIsInActive.current = isInActiveAccessLevel?.accessLevel === HIDDEN
        hiddenIsBlocked.current = isBlockedAccessLevel?.accessLevel === HIDDEN
      }
    })()
  }, [formik.values.countryId])

  useEffect(() => {
    ;(async function () {
      if (recordId && client?.clientId && beneficiary?.beneficiaryId && beneficiary?.beneficiarySeqNo) {
        const RTBEC = await getRequest({
          extension: RemittanceOutwardsRepository.BeneficiaryCash.get,
          parameters: `_clientId=${client?.clientId}&_beneficiaryId=${beneficiary?.beneficiaryId}&_seqNo=${beneficiary?.beneficiarySeqNo}`
        })

        const RTBEN = await getRequest({
          extension: RemittanceOutwardsRepository.Beneficiary.get,
          parameters: `_clientId=${client?.clientId}&_beneficiaryId=${beneficiary?.beneficiaryId}&_seqNo=${beneficiary?.beneficiarySeqNo}`
        })

        if (!RTBEC?.record?.firstName) setNotArabic(false)

        const obj = {
          //RTBEN
          clientId: client?.clientId,
          recordId,
          beneficiaryId: beneficiary?.beneficiaryId,
          name: RTBEN?.record?.name,
          dispersalType,
          nationalityId: RTBEN?.record?.nationalityId,
          isBlocked: RTBEN?.record?.isBlocked,
          isInactive: RTBEN?.record?.isInactive,
          stoppedDate: RTBEN?.record?.stoppedDate && formatDateFromApi(RTBEN.record.stoppedDate),
          stoppedReason: RTBEN?.record?.stoppedReason,
          gender: RTBEN?.record?.gender,
          rtId: RTBEN?.record?.rtId,
          cobId: RTBEN?.record?.cobId,
          cellPhone: RTBEN?.record?.cellPhone,
          birthDate: RTBEN?.record?.birthDate && formatDateFromApi(RTBEN.record.birthDate),
          currencyId: RTBEN?.record?.currencyId,
          addressLine1: RTBEN?.record?.addressLine1,
          addressLine2: RTBEN?.record?.addressLine2,
          clientRef: RTBEN?.record?.clientRef,
          clientName: RTBEN?.record?.clientName,
          countryId: RTBEN?.record?.countryId,
          seqNo: RTBEN?.record?.seqNo,

          //RTBEC
          firstName: RTBEC?.record?.firstName,
          lastName: RTBEC?.record?.lastName,
          middleName: RTBEC?.record?.middleName,
          familyName: RTBEC?.record?.familyName,
          fl_firstName: RTBEC?.record?.fl_firstName,
          fl_lastName: RTBEC?.record?.fl_lastName,
          fl_middleName: RTBEC?.record?.fl_middleName,
          fl_familyName: RTBEC?.record?.fl_familyName,
          birthPlace: RTBEC?.record?.birthPlace,
          seqNo: RTBEC?.record?.seqNo
        }

        formik.setValues(obj)
      }
    })()
  }, [recordId])

  useEffect(() => {
    if (resetForm) {
      formik.resetForm()
      setResetForm(false)
    }
  }, [resetForm])
  useEffect(() => {
    const values = formik.values

    const header = {
      clientId: values.clientId,
      beneficiaryId: values.beneficiaryId,
      gender: values.gender,
      rtId: values.rtId,
      name: values.name,
      dispersalType: values.dispersalType,
      isBlocked: values.isBlocked,
      isInactive: values.isInactive,
      stoppedDate: values.stoppedDate ? formatDateToApi(values.stoppedDate) : null,
      stoppedReason: values.stoppedReason,
      nationalityId: values.nationalityId,
      cobId: values.cobId,
      birthDate: values.birthDate ? formatDateToApi(values.birthDate) : null,
      currencyId: values.currencyId,
      cellPhone: values.cellPhone,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2,
      clientRef: values.clientRef,
      clientName: values.clientName,
      countryId: values.countryId,
      seqNo: values.seqNo
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
      birthPlace: values.birthPlace,
      seqNo: values.seqNo
    }
    const data = { header: header, beneficiaryCash: cashInfo }
    if (onChange) onChange(data)
  }, [formik.values])

  useEffect(() => {
    if (!submitMainForm) {
      const errors = Object.keys(formik.errors).length !== 0
      if (errors) {
        setSubmitted(false)
        formik.handleSubmit()

        return
      }
      if (submitted && !errors) setValidSubmit(true)
    }
  }, [submitted])

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
    if (!editMode) {
      if (nameParts.length === 2) {
        return {
          firstName: nameParts[0],
          middleName: '',
          lastName: nameParts[1],
          familyName: ''
        }
      }

      if (nameParts.length === 3) {
        return {
          firstName: nameParts[0],
          middleName: nameParts[1],
          lastName: nameParts[2],
          familyName: ''
        }
      }

      if (nameParts.length > 3) {
        const firstName = nameParts.shift()
        const familyName = nameParts.pop()
        const middleName = nameParts.slice(0, -1).join(' ') || ''
        const lastName = nameParts[nameParts.length - 1] || ''

        return { firstName, middleName, lastName, familyName }
      }

      return {
        firstName: nameParts[0] || '',
        middleName: '',
        lastName: '',
        familyName: ''
      }
    }
  }

  return (
    <FormShell
      resourceId={ResourceIds.BeneficiaryCash}
      form={formik}
      editMode={editMode}
      maxAccess={maxAccess}
      disabledSubmit={editMode}
      isCleared={!forceDisable && viewBtns}
      isSaved={viewBtns}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <FormGrid item hideonempty xs={6}>
              <ResourceLookup
                endpointId={CTCLRepository.ClientCorporate.snapshot}
                parameters={{
                  _category: 0
                }}
                valueField='reference'
                displayField='name'
                name='clientId'
                label={_labels.client}
                form={formik}
                required
                readOnly={editMode}
                displayFieldWidth={2}
                valueShow='clientRef'
                secondValueShow='clientName'
                maxAccess={maxAccess}
                columnsInDropDown={[
                  { key: 'reference', value: 'Ref.' },
                  { key: 'name', value: 'Name' },
                  { key: 'cellPhone', value: 'Cell Phone' }
                ]}
                onChange={async (event, newValue) => {
                  if (newValue?.status == -1) {
                    stackError({
                      message: `Chosen Client Must Be Active.`
                    })

                    return
                  }
                  formik.setFieldValue('clientId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('clientName', newValue ? newValue.name : '')
                  formik.setFieldValue('clientRef', newValue ? newValue.reference : '')
                }}
                errorCheck={'clientId'}
              />
            </FormGrid>
            <FormGrid item hideonempty xs={6}>
              <ResourceComboBox
                endpointId={SystemRepository.Country.qry}
                name='countryId'
                label={_labels.benCountry}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                  { key: 'flName', value: 'Foreign Language Name' }
                ]}
                displayFieldWidth={0.8}
                readOnly={(formik.values.countryId && editMode) || countryId || editMode}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('countryId', newValue ? newValue.recordId : '')
                }}
                error={formik.touched.countryId && Boolean(formik.errors.countryId)}
                maxAccess={maxAccess}
                required
              />
            </FormGrid>
            <FormGrid item hideonempty xs={6}>
              <ResourceComboBox
                endpointId={SystemRepository.Currency.qry}
                name='currencyId'
                label={_labels.currency}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                  { key: 'flName', value: 'Foreign Language Name' }
                ]}
                displayFieldWidth={0.8}
                values={formik.values}
                required
                readOnly={(formik.values.currencyId && editMode) || currencyId || editMode}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('currencyId', newValue?.recordId || null)
                }}
                error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
              />
            </FormGrid>
            <Grid item xs={6}></Grid>
            <FormGrid item hideonempty xs={6}>
              <CustomTextField
                name='name'
                label={_labels.name}
                value={formik.values?.name}
                maxLength='50'
                required
                onChange={formik.handleChange}
                onBlur={e => {
                  !editMode && constructNameField(formik.values)
                }}
                error={formik.touched.name && Boolean(formik.errors.name)}
                maxAccess={maxAccess}
                readOnly={editMode}
              />
            </FormGrid>
            <Grid item xs={6}></Grid>
            <Grid item xs={12}>
              <Grid container spacing={2}>
                <FormGrid item hideonempty xs={3}>
                  <CustomTextField
                    name='firstName'
                    label={_labels.firstName}
                    value={formik.values?.firstName}
                    required
                    readOnly={notArabic || editMode}
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
                    readOnly={notArabic || editMode}
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
            </Grid>
            <Grid item xs={12}>
              <Grid container sx={{ flexDirection: 'row-reverse' }} spacing={2}>
                <FormGrid item hideonempty xs={3}>
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
                <FormGrid item hideonempty xs={3}>
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
                <FormGrid item hideonempty xs={3}>
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
                <FormGrid item hideonempty xs={3}>
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
            </Grid>
            <FormGrid item hideonempty xs={6}>
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
                displayFieldWidth={0.8}
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
                readOnly={editMode}
              />
            </FormGrid>
            <FormGrid item hideonempty xs={6}>
              <CustomDatePicker
                name='birthDate'
                label={_labels.birthDate}
                value={formik.values?.birthDate}
                onChange={formik.setFieldValue}
                disabledDate={'>='}
                onClear={() => formik.setFieldValue('birthDate', '')}
                error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
                maxAccess={maxAccess}
                readOnly={editMode}
              />
            </FormGrid>
            <FormGrid item hideonempty xs={6}>
              <ResourceComboBox
                endpointId={SystemRepository.Country.qry}
                name='cobId'
                label={_labels.countryOfBirth}
                valueField='recordId'
                displayField={['reference', 'name']}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                  { key: 'flName', value: 'Foreign Language Name' }
                ]}
                displayFieldWidth={0.8}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('cobId', newValue ? newValue.recordId : '')
                }}
                error={formik.touched.cobId && Boolean(formik.errors.cobId)}
                maxAccess={maxAccess}
                readOnly={editMode}
              />
            </FormGrid>
            <FormGrid item hideonempty xs={6}>
              <CustomTextField
                name='birthPlace'
                label={_labels.birthPlace}
                value={formik.values?.birthPlace}
                onChange={formik.handleChange}
                maxLength='50'
                onClear={() => formik.setFieldValue('birthPlace', '')}
                error={formik.touched.birthPlace && Boolean(formik.errors.birthPlace)}
                maxAccess={maxAccess}
                readOnly={editMode}
              />
            </FormGrid>
            <FormGrid item hideonempty xs={6}>
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
                readOnly={editMode}
              />
            </FormGrid>
            <FormGrid item hideonempty xs={6}>
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
                readOnly={editMode}
              />
            </FormGrid>
            <FormGrid item hideonempty xs={6}>
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
                readOnly={editMode}
              />
            </FormGrid>
            <FormGrid item hideonempty xs={6}>
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
                readOnly={editMode}
              />
            </FormGrid>
            {!hiddenIsInActive.current && (
              <FormGrid item hideonempty xs={6}>
                <CustomCheckBox
                  name='isInactive'
                  value={formik.values.isInactive}
                  onChange={event => formik.setFieldValue('isInactive', event.target.checked)}
                  label={_labels.isInactive}
                  maxAccess={maxAccess}
                  disabled={true}
                />
              </FormGrid>
            )}
            <FormGrid item hideonempty xs={6}>
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
                maxAccess={maxAccess}
                error={formik.touched.rtId && Boolean(formik.errors.rtId)}
                readOnly={editMode}
              />
            </FormGrid>
            {!hiddenIsBlocked.current && (
              <FormGrid item hideonempty xs={6}>
                <CustomCheckBox
                  name='isBlocked'
                  value={formik.values?.isBlocked}
                  onChange={event => formik.setFieldValue('isBlocked', event.target.checked)}
                  label={_labels.isBlocked}
                  maxAccess={maxAccess}
                  disabled={true}
                />
              </FormGrid>
            )}
            <Grid item xs={6}></Grid>
            <FormGrid item hideonempty xs={6}>
              <CustomDatePicker
                name='stoppedDate'
                label={_labels.stoppedDate}
                value={formik.values?.stoppedDate}
                readOnly={true}
                error={formik.touched.stoppedDate && Boolean(formik.errors.stoppedDate)}
                maxAccess={maxAccess}
              />
            </FormGrid>
            <Grid item xs={6}></Grid>
            <FormGrid item hideonempty xs={6}>
              <CustomTextArea
                name='stoppedReason'
                label={_labels.stoppedReason}
                readOnly
                value={formik.values.stoppedReason}
                rows={3}
                error={formik.touched.stoppedReason && Boolean(formik.errors.stoppedReason)}
                maxAccess={maxAccess}
              />
            </FormGrid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}

BenificiaryCashForm.width = 700
BenificiaryCashForm.height = 500

export default BenificiaryCashForm
