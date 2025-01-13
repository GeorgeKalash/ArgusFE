import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useEffect, useContext, useState, useRef } from 'react'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { DataSets } from 'src/resources/DataSets'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import toast from 'react-hot-toast'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import FormGrid from 'src/components/form/layout/FormGrid'
import { useForm } from 'src/hooks/form'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import { useError } from 'src/error'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { HIDDEN } from 'src/services/api/maxAccess'
import CustomCheckBox from '../Inputs/CustomCheckBox'
import { Fixed } from './Layouts/Fixed'

export default function BenificiaryBankForm({
  viewBtns = true,
  editable = false,
  client,
  beneficiary,
  dispersalType,
  corId,
  submitted,
  setSubmitted,
  countryId,
  currencyId,
  resetForm,
  setResetForm,
  onChange,
  setValidSubmit,
  onSuccess,
  submitMainForm = true
}) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const [maxAccess, setMaxAccess] = useState({ record: [] })
  const { stack: stackError } = useError()
  const [editMode, setEditMode] = useState(beneficiary?.beneficiaryId && !editable)
  const hiddenIsInActive = useRef(false)
  const hiddenIsBlocked = useRef(false)

  const initialValues = {
    //RTBEN
    clientId: client?.clientId || '',
    beneficiaryId: 0,
    recordId: '',
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
    cellPhone: '',
    cellPhoneRepeated: '',
    birthDate: null,
    cobId: '',
    shortName: '',
    addressLine1: '',
    addressLine2: '',
    clientRef: client?.clientRef || '',
    clientName: client?.clientName || '',
    countryId: countryId || '',
    currencyId: currencyId || null,
    seqNo: 1,

    //RTBEB
    bankId: null,
    accountRef: '',
    accountRefRepeat: '',
    accountType: '',
    IBAN: '',
    IBANRepeated: '',
    routingNo: '',
    swiftCode: '',
    branchCode: '',
    branchName: '',
    state: '',
    city: '',
    zipcode: '',
    remarks: '',
    seqNo: 1
  }

  const { formik } = useForm({
    maxAccess,
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      clientId: yup.string().required(),
      countryId: yup.string().required(),
      name: yup.string().required(),
      bankId: yup.string().required(),
      currencyId: yup.string().required(),
      accountRefRepeat: yup.string().test('accountRef must match', 'Error', function (value) {
        const { accountRef } = this.parent

        return accountRef == value
      }),
      IBANRepeated: yup.string().test('IBAN must match', 'Error', function (value) {
        const { IBAN } = this.parent

        return IBAN == value
      }),
      cellPhoneRepeated: yup.number().test('cellPhone must match', 'Error', function (value) {
        const { cellPhone } = this.parent

        return cellPhone == value
      })
    }),
    onSubmit: async values => {
      if (submitMainForm) {
        const header = {
          clientId: values.clientId,
          clientRef: values.clientRef,
          clientName: values.clientName,
          beneficiaryId: values.beneficiaryId,
          gender: values.gender,
          rtId: values.rtId,
          rtName: values.rtName,
          name: values.name,
          dispersalType: values.dispersalType,
          isBlocked: values.isBlocked,
          isInactive: values.isInactive,
          stoppedDate: values.stoppedDate ? formatDateToApi(values.stoppedDate) : null,
          stoppedReason: values.stoppedReason,
          nationalityId: values.nationalityId,
          cellPhone: values.cellPhone,
          birthDate: values.birthDate ? formatDateToApi(values.birthDate) : null,
          cobId: values.cobId,
          shortName: values.shortName,
          addressLine1: values.addressLine1,
          addressLine2: values.addressLine2,
          countryId: values.countryId,
          currencyId: values.currencyId,
          seqNo: values.seqNo
        }

        const bankInfo = {
          bankId: values.bankId,
          clientId: values.clientId,
          beneficiaryId: values.beneficiaryId,
          accountRef: values.accountRef,
          accountType: values.accountType,
          IBAN: values.IBAN,
          routingNo: values.routingNo,
          swiftCode: values.swiftCode,
          branchCode: values.branchCode,
          branchName: values.branchName,
          city: values.city,
          state: values.state,
          zipcode: values.zipcode,
          seqNo: values.seqNo
        }
        const data = { header: header, beneficiaryBank: bankInfo }

        const res = await postRequest({
          extension: RemittanceOutwardsRepository.BeneficiaryBank.set,
          record: JSON.stringify(data)
        })

        toast.success('Record Updated Successfully')
        if (onSuccess) onSuccess(res.recordId, values.name)
        setEditMode(true)
      }
    }
  })

  useEffect(() => {
    ;(async function () {
      if (formik.values.countryId && dispersalType) {
        const qryCCL = await getRequest({
          extension: RemittanceSettingsRepository.CorrespondentControl.qry,
          parameters: `_countryId=${formik.values.countryId}&_corId=${corId || 0}&_resourceId=${
            ResourceIds.BeneficiaryBank
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

      if (beneficiary?.beneficiaryId && client?.clientId) {
        const RTBEB = await getRequest({
          extension: RemittanceOutwardsRepository.BeneficiaryBank.get,
          parameters: `_clientId=${client?.clientId}&_beneficiaryId=${beneficiary?.beneficiaryId}&_seqNo=${beneficiary?.beneficiarySeqNo}`
        })

        const RTBEN = await getRequest({
          extension: RemittanceOutwardsRepository.Beneficiary.get,
          parameters: `_clientId=${client?.clientId}&_beneficiaryId=${beneficiary?.beneficiaryId}&_seqNo=${beneficiary?.beneficiarySeqNo}`
        })

        const obj = {
          //RTBEN
          clientId: client?.clientId,
          beneficiaryId: beneficiary?.beneficiaryId,
          recordId: client?.clientId * 1000 + beneficiary?.beneficiaryId,
          name: RTBEN?.record?.name,
          dispersalType: dispersalType,
          nationalityId: RTBEN?.record?.nationalityId,
          isBlocked: RTBEN?.record?.isBlocked,
          isInactive: RTBEN?.record?.isInactive,
          stoppedDate: RTBEN?.record?.stoppedDate && formatDateFromApi(RTBEN.record.stoppedDate),
          stoppedReason: RTBEN?.record?.stoppedReason,
          gender: RTBEN?.record?.gender,
          rtId: RTBEN?.record?.rtId,
          rtName: RTBEN?.record?.rtName,
          cellPhone: RTBEN?.record?.cellPhone,
          cellPhoneRepeated: RTBEN?.record?.cellPhone,
          birthDate: RTBEN?.record?.birthDate && formatDateFromApi(RTBEN.record.birthDate),
          cobId: RTBEN?.record?.cobId,
          shortName: RTBEN?.record?.shortName,
          addressLine1: RTBEN?.record?.addressLine1,
          addressLine2: RTBEN?.record?.addressLine2,
          clientRef: RTBEN?.record?.clientRef,
          clientName: RTBEN?.record?.clientName,
          countryId: RTBEN?.record?.countryId,
          currencyId: RTBEN?.record?.currencyId,
          seqNo: RTBEN?.record?.seqNo,

          //RTBEB
          bankId: RTBEB?.record?.bankId,
          accountRef: RTBEB?.record?.accountRef,
          accountRefRepeat: RTBEB?.record?.accountRef,
          accountType: RTBEB?.record?.accountType,
          IBAN: RTBEB?.record?.IBAN,
          IBANRepeated: RTBEB?.record?.IBAN,
          routingNo: RTBEB?.record?.routingNo,
          swiftCode: RTBEB?.record?.swiftCode,
          branchCode: RTBEB?.record?.branchCode,
          branchName: RTBEB?.record?.branchName,
          state: RTBEB?.record?.state,
          city: RTBEB?.record?.city,
          zipcode: RTBEB?.record?.zipcode,
          remarks: RTBEB?.record?.remarks,
          seqNo: RTBEB?.record?.seqNo
        }
        formik.setValues(obj)
      }
    })()
  }, [beneficiary?.beneficiaryId, beneficiary?.beneficiarySeqNo, client?.clientId, formik.values.countryId])

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
      clientRef: values.clientRef,
      clientName: values.clientName,
      beneficiaryId: values.beneficiaryId,
      gender: values.gender,
      rtId: values.rtId,
      rtName: values.rtName,
      name: values.name,
      dispersalType: values.dispersalType,
      isBlocked: values.isBlocked,
      isInactive: values.isInactive,
      stoppedDate: values.stoppedDate ? formatDateToApi(values.stoppedDate) : null,
      stoppedReason: values.stoppedReason,
      nationalityId: values.nationalityId,
      cellPhone: values.cellPhone,
      birthDate: values.birthDate ? formatDateToApi(values.birthDate) : null,
      cobId: values.cobId,
      shortName: values.shortName,
      addressLine1: values.addressLine1,
      addressLine2: values.addressLine2,
      countryId: values.countryId,
      currencyId: values.currencyId,
      seqNo: values.seqNo
    }

    const bankInfo = {
      bankId: values.bankId,
      clientId: values.clientId,
      beneficiaryId: values.beneficiaryId,
      accountRef: values.accountRef,
      accountType: values.accountType,
      IBAN: values.IBAN,
      routingNo: values.routingNo,
      swiftCode: values.swiftCode,
      branchCode: values.branchCode,
      branchName: values.branchName,
      city: values.city,
      state: values.state,
      zipcode: values.zipcode,
      seqNo: values.seqNo
    }
    const data = { header: header, beneficiaryBank: bankInfo }
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

  const { labels: _labels } = useResourceQuery({
    datasetId: ResourceIds.BeneficiaryBank
  })

  const handleCopy = event => {
    event.preventDefault()
  }

  return (
    <FormShell
      resourceId={ResourceIds.BeneficiaryBank}
      form={formik}
      editMode={editMode}
      setEditMode={setEditMode}
      maxAccess={maxAccess}
      disabledSubmit={editMode}
      isCleared={viewBtns}
      isInfo={viewBtns}
      isSaved={viewBtns}
    >
      <VertLayout>
        <Fixed>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <FormGrid item hideonempty xs={12}>
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
                    valueShow='clientRef'
                    secondValueShow='clientName'
                    maxAccess={maxAccess}
                    displayFieldWidth={3}
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
                <FormGrid item hideonempty xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Country.qry}
                    name='countryId'
                    label={_labels.benCountry}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'flName', value: 'FL Name' }
                    ]}
                    readOnly={(formik.values.countryId && editMode) || countryId || editMode}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('countryId', newValue ? newValue.recordId : '')
                      formik.setFieldValue('bankId', '')
                    }}
                    error={formik.touched.countryId && Boolean(formik.errors.countryId)}
                    maxAccess={maxAccess}
                    required
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
                  <ResourceComboBox
                    endpointId={(countryId || formik.values.countryId) && CashBankRepository.CbBank.qry2}
                    parameters={countryId ? `_countryId=${countryId}` : `_countryId=${formik.values.countryId}`}
                    name='bankId'
                    label={_labels.bank}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' }
                    ]}
                    maxAccess={maxAccess}
                    required
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('bankId', newValue ? newValue.recordId : '')
                    }}
                    error={formik.touched.bankId && Boolean(formik.errors.bankId)}
                    readOnly={(formik.values.countryId && editMode) || editMode || !formik.values.countryId}
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Currency.qry}
                    name='currencyId'
                    label={_labels.currency}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'flName', value: 'FL Name' }
                    ]}
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
                <FormGrid item hideonempty xs={12}>
                  <CustomTextField
                    name='accountRef'
                    label={_labels.accountRef}
                    value={formik.values.accountRef}
                    onChange={formik.handleChange}
                    maxLength='50'
                    error={formik.touched.accountRef && Boolean(formik.errors.accountRef)}
                    maxAccess={maxAccess}
                    readOnly={editMode}
                    onCopy={handleCopy}
                    onPaste={handleCopy}
                    onClear={() => formik.setFieldValue('accountRef', '')}
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
                  <CustomTextField
                    name='accountRefRepeat'
                    label={_labels.confirmAccountRef}
                    value={formik.values.accountRefRepeat}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    maxLength='50'
                    error={formik.touched.accountRefRepeat && Boolean(formik.errors.accountRefRepeat)}
                    maxAccess={maxAccess}
                    readOnly={editMode}
                    required={formik.values.accountRef}
                    onCopy={handleCopy}
                    onPaste={handleCopy}
                    onClear={() => formik.setFieldValue('accountRefRepeat', '')}
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
                  <CustomTextField
                    name='branchName'
                    label={_labels.branchName}
                    rows={3}
                    value={formik.values.branchName}
                    onChange={formik.handleChange}
                    maxLength='100'
                    error={formik.touched.branchName && Boolean(formik.errors.branchName)}
                    readOnly={editMode}
                    maxAccess={maxAccess}
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
                  <CustomTextField
                    name='branchCode'
                    label={_labels.branchCode}
                    value={formik.values.branchCode}
                    onChange={formik.handleChange}
                    maxLength='20'
                    error={formik.touched.branchCode && Boolean(formik.errors.branchCode)}
                    maxAccess={maxAccess}
                    readOnly={editMode}
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
                  <CustomDatePicker
                    name='birthDate'
                    label={_labels.birthDate}
                    value={formik.values?.birthDate}
                    onChange={formik.setFieldValue}
                    onClear={() => formik.setFieldValue('birthDate', '')}
                    error={formik.touched.birthDate && Boolean(formik.errors.birthDate)}
                    maxAccess={maxAccess}
                    readOnly={editMode}
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Country.qry}
                    name='cobId'
                    label={_labels.countryOfBirth}
                    valueField='recordId'
                    displayField={['reference', 'name']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'flName', value: 'FL Name' }
                    ]}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('cobId', newValue ? newValue.recordId : '')
                    }}
                    error={formik.touched.cobId && Boolean(formik.errors.cobId)}
                    maxAccess={maxAccess}
                    readOnly={editMode}
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.BANK_ACCOUNT_TYPE}
                    name='accountType'
                    label={_labels.accountType}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        formik.setFieldValue('accountType', newValue?.key)
                      } else {
                        formik.setFieldValue('accountType', '')
                      }
                    }}
                    maxAccess={maxAccess}
                    error={formik.touched.accountType && Boolean(formik.errors.accountType)}
                    readOnly={editMode}
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
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
                <FormGrid item hideonempty xs={12}>
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
                <FormGrid item hideonempty xs={12}>
                  <ResourceComboBox
                    endpointId={SystemRepository.Country.qry}
                    name='nationalityId'
                    label={_labels.country}
                    valueField='recordId'
                    displayField={['reference', 'name', 'flName']}
                    columnsInDropDown={[
                      { key: 'reference', value: 'Reference' },
                      { key: 'name', value: 'Name' },
                      { key: 'flName', value: 'FL Name' }
                    ]}
                    maxAccess={maxAccess}
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('state', '')
                      formik.setFieldValue('city', '')
                      formik.setFieldValue('nationalityId', newValue ? newValue.recordId : '')
                    }}
                    error={formik.touched.nationalityId && Boolean(formik.errors.nationalityId)}
                    readOnly={editMode}
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
                  <CustomTextField
                    name='state'
                    label={_labels.state}
                    value={formik.values.state}
                    onChange={formik.handleChange}
                    error={formik.touched.state && Boolean(formik.errors.state)}
                    maxAccess={maxAccess}
                    readOnly={editMode}
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
                  <CustomTextField
                    name='city'
                    label={_labels.city}
                    value={formik.values.city}
                    onChange={formik.handleChange}
                    error={formik.touched.city && Boolean(formik.errors.city)}
                    maxAccess={maxAccess}
                    readOnly={editMode}
                  />
                </FormGrid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <FormGrid item hideonempty xs={12}>
                  <CustomTextField
                    name='name'
                    label={_labels.name}
                    value={formik.values.name}
                    required
                    onChange={formik.handleChange}
                    maxLength='50'
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    maxAccess={maxAccess}
                    readOnly={editMode}
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
                  <CustomTextField
                    name='shortName'
                    label={_labels.shortName}
                    value={formik.values.shortName}
                    onChange={formik.handleChange}
                    maxLength='50'
                    error={formik.touched.shortName && Boolean(formik.errors.shortName)}
                    maxAccess={maxAccess}
                    readOnly={editMode}
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
                  <CustomTextField
                    name='cellPhone'
                    label={_labels.cellPhone}
                    value={formik.values?.cellPhone}
                    phone={true}
                    onChange={formik.handleChange}
                    maxLength='20'
                    autoComplete='off'
                    onClear={() => formik.setFieldValue('cellPhone', '')}
                    error={formik.touched.cellPhone && Boolean(formik.errors.cellPhone)}
                    maxAccess={maxAccess}
                    readOnly={editMode}
                    onCopy={handleCopy}
                    onPaste={handleCopy}
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
                  <CustomTextField
                    name='cellPhoneRepeated'
                    label={_labels.confirmCellPhone}
                    value={formik.values?.cellPhoneRepeated}
                    phone={true}
                    onChange={formik.handleChange}
                    maxLength='20'
                    autoComplete='off'
                    onClear={() => formik.setFieldValue('cellPhoneRepeated', '')}
                    error={formik.touched.cellPhoneRepeated && Boolean(formik.errors.cellPhoneRepeated)}
                    maxAccess={maxAccess}
                    readOnly={editMode}
                    onCopy={handleCopy}
                    onPaste={handleCopy}
                    onBlur={formik.handleBlur}
                    required={formik.values.cellPhone}
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
                  <ResourceComboBox
                    datasetId={DataSets.GENDER}
                    name='gender'
                    label={_labels.gender}
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        formik.setFieldValue('gender', newValue?.key)
                      } else {
                        formik.setFieldValue('gender', '')
                      }
                    }}
                    maxAccess={maxAccess}
                    error={formik.touched.gender && Boolean(formik.errors.gender)}
                    helperText={formik.touched.gender && formik.errors.gender}
                    readOnly={editMode}
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
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
                <FormGrid item hideonempty xs={12}>
                  <CustomTextField
                    name='zipcode'
                    label={_labels.zipCode}
                    value={formik.values.zipcode}
                    maxLength='30'
                    onChange={formik.handleChange}
                    error={formik.touched.zipcode && Boolean(formik.errors.zipcode)}
                    maxAccess={maxAccess}
                    readOnly={editMode}
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
                  <CustomTextField
                    name='swiftCode'
                    label={_labels.ifscSwift}
                    maxLength='30'
                    value={formik.values.swiftCode}
                    onChange={formik.handleChange}
                    error={formik.touched.swiftCode && Boolean(formik.errors.swiftCode)}
                    maxAccess={maxAccess}
                    readOnly={editMode}
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
                  <CustomTextField
                    name='routingNo'
                    label={_labels.routingNo}
                    maxLength='50'
                    value={formik.values.routingNo}
                    onChange={formik.handleChange}
                    error={formik.touched.routingNo && Boolean(formik.errors.routingNo)}
                    maxAccess={maxAccess}
                    readOnly={editMode}
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
                  <CustomTextField
                    name='IBAN'
                    label={_labels.iban}
                    maxLength='50'
                    value={formik.values.IBAN}
                    onChange={formik.handleChange}
                    error={formik.touched.IBAN && Boolean(formik.errors.IBAN)}
                    maxAccess={maxAccess}
                    readOnly={editMode}
                    onCopy={handleCopy}
                    onPaste={handleCopy}
                    onClear={() => formik.setFieldValue('IBAN', '')}
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
                  <CustomTextField
                    name='IBANRepeated'
                    label={_labels.confirmIBAN}
                    maxLength='50'
                    value={formik.values.IBANRepeated}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('IBANRepeated', '')}
                    error={formik.touched.IBANRepeated && Boolean(formik.errors.IBANRepeated)}
                    maxAccess={maxAccess}
                    readOnly={editMode}
                    onCopy={handleCopy}
                    onPaste={handleCopy}
                    onBlur={formik.handleBlur}
                    required={formik.values.IBAN}
                  />
                </FormGrid>
                {!hiddenIsInActive.current && (
                  <FormGrid item hideonempty xs={12}>
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
                {!hiddenIsBlocked.current && (
                  <FormGrid item hideonempty xs={12}>
                    <CustomCheckBox
                      name='isBlocked'
                      value={formik.values.isBlocked}
                      onChange={event => formik.setFieldValue('isBlocked', event.target.checked)}
                      label={_labels.isBlocked}
                      maxAccess={maxAccess}
                      disabled={true}
                    />
                  </FormGrid>
                )}
                <FormGrid item hideonempty xs={12}>
                  <CustomTextArea
                    name='remarks'
                    label={_labels.remarks}
                    value={formik.values.remarks}
                    rows={3}
                    maxLength='150'
                    maxAccess={maxAccess}
                    onChange={formik.handleChange}
                    onClear={() => formik.setFieldValue('remarks', '')}
                    error={formik.touched.remarks && Boolean(formik.errors.remarks)}
                    readOnly={editMode}
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
                  <CustomDatePicker
                    name='stoppedDate'
                    label={_labels.stoppedDate}
                    value={formik.values?.stoppedDate}
                    readOnly
                    error={formik.touched.stoppedDate && Boolean(formik.errors.stoppedDate)}
                    maxAccess={maxAccess}
                  />
                </FormGrid>
                <FormGrid item hideonempty xs={12}>
                  <CustomTextArea
                    name='stoppedReason'
                    label={_labels.stoppedReason}
                    readOnly
                    value={formik.values.stoppedReason}
                    rows={3}
                    maxAccess={maxAccess}
                    error={formik.touched.stoppedReason && Boolean(formik.errors.stoppedReason)}
                  />
                </FormGrid>
              </Grid>
            </Grid>
          </Grid>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
