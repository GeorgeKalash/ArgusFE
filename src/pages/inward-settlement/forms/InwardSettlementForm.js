import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FieldSet from 'src/components/Shared/FieldSet'
import FormShell from 'src/components/Shared/FormShell'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useError } from 'src/error'
import { useDocumentType } from 'src/hooks/documentReferenceBehaviors'
import { useForm } from 'src/hooks/form'
import { useInvalidate } from 'src/hooks/resource'
import { formatDateFromApi, formatDateToApi } from 'src/lib/date-helper'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DataSets } from 'src/resources/DataSets'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SystemFunction } from 'src/resources/SystemFunction'
import * as yup from 'yup'
import { ControlContext } from 'src/providers/ControlContext'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'
import { getStorageData } from 'src/storage/storage'
import CustomCheckBox from 'src/components/Inputs/CustomCheckBox'

export default function InwardSettlementForm({ labels, recordId, access, plantId, cashAccountId, dtId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const { platformLabels, defaultsData } = useContext(ControlContext)
  const userId = getStorageData('userData').userId
  const [mismatchedFields, setMismatchedFields] = useState([])

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.InwardSettlement.snapshot
  })

  const initialValues = {
    recordId: recordId || null,
    dtId: dtId ? parseInt(dtId) : null,
    date: new Date(),
    inwardDate: null,
    reference: '',
    plantId: parseInt(plantId),
    cashAccountId: parseInt(cashAccountId),
    inwardId: '',
    corId: null,
    clientId: null,
    dispersalMode: null,
    amount: '',
    baseAmount: '',
    charges: 0,
    sender_nationalityId: null,
    sender_firstName: '',
    sender_middleName: '',
    sender_lastName: '',
    receiver_nationalityId: null,
    purposeOfTransfer: null,
    currencyId: null,
    sourceOfIncome: null,
    receiver_relationId: null,
    interfaceId: null,
    category: null,
    sender_category: null,
    wip: 1,
    status: 1,
    releaseStatus: null,
    inw_receiver_idNo: '',
    inw_receiver_address1: '',
    inw_receiver_address2: ''
  }

  const { maxAccess } = useDocumentType({
    functionId: SystemFunction.InwardSettlement,
    access,
    hasDT: false
  })

  const { formik } = useForm({
    maxAccess,
    initialValues,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.string().required(),
      corRef: yup.string().required(),
      clientId: yup.string().required(),
      amount: yup.number().required(),
      dispersalMode: yup.number().required(),
      currencyId: yup.string().required(),
      inwardId: yup.string().test('is-inward-mandatory', 'Inward reference is required', function () {
        const { interfaceId } = this.parent

        return interfaceId == null || interfaceId === '' || interfaceId === undefined
      }),
      charges: yup.string().test('is-charges-mandatory', 'Charges is required', function () {
        const { inwardId } = this.parent
        if (inwardId == null || inwardId === '') return true

        return inwardId !== null && inwardId !== ''
      }),
      sender_firstName: yup.string().test('is-first-mandatory', 'Sender first name is required', function () {
        const { inwardId } = this.parent
        if (inwardId == null || inwardId === '') return true

        return inwardId !== null && inwardId !== ''
      }),
      sender_lastName: yup.string().test('is-lastName-mandatory', 'Sender last name is required', function () {
        const { inwardId } = this.parent
        if (inwardId == null || inwardId === '') return true

        return inwardId !== null && inwardId !== ''
      }),
      sender_nationalityId: yup
        .string()
        .test('is-nationality-mandatory', 'Sender Nationality is required', function () {
          const { inwardId } = this.parent
          if (inwardId == null || inwardId === '') return true

          return inwardId !== null && inwardId !== ''
        }),
      category: yup.string().test('is-category-mandatory', 'Category is required', function () {
        const { inwardId } = this.parent
        if (inwardId == null || inwardId === '') return true

        return inwardId !== null && inwardId !== ''
      })
    }),
    onSubmit: async () => {
      try {
        const copy = { ...formik.values }
        copy.date = formatDateToApi(copy?.date)

        if (copy.inwardId) {
          await submitIWS(copy, copy.inwardId)
        } else {
          const checkDT = await getDefaultDT()
          const vatPct = await getDefaultVAT()
          if (!checkDT) {
            stackError({
              message: labels.assignDefaultDocType
            })

            return
          }

          const data = {
            recordId: null,
            reference: null,
            date: formatDateToApi(new Date()),
            plantId: parseInt(plantId),
            userId: parseInt(userId),
            exRate: 1,
            rateCalcMethod: 1,
            taxAmount: (formik.values.charges * vatPct) / 100,
            netAmount: formik.values.amount - formik.values.charges - (formik.values.charges * vatPct) / 100,
            corId: formik.values.corId,
            currencyId: formik.values.currencyId,
            amount: formik.values.amount,
            baseAmount: formik.values.amount,
            sender_firstName: formik.values.sender_firstName,
            sender_middleName: formik.values.sender_middleName,
            sender_lastName: formik.values.sender_lastName,
            sender_nationalityId: formik.values.sender_nationalityId,
            receiver_category: formik.values.category,
            receiver_firstName: formik.values.receiver_firstName,
            receiver_middleName: formik.values.receiver_middleName,
            receiver_lastName: formik.values.receiver_lastName,
            dispersalMode: formik.values.dispersalMode,
            charges: formik.values.charges,
            wip: 1,
            status: 1
          }

          const res = await postRequest({
            extension: RemittanceOutwardsRepository.InwardsTransfer.set,
            record: JSON.stringify(data)
          })

          formik.setFieldValue('inwardId', res.recordId)
          const resIW = await getInwardsTransfer(res.recordId)
          await closeInwardTransfer(res.recordId, resIW?.record?.reference, data)
          await postInwardTransfer(res.recordId, resIW?.record?.reference, data)
          await submitIWS(copy, res.recordId)
        }
      } catch (error) {
        stackError(error)
      }
    }
  })

  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip === 2
  const isPosted = formik.values.status === 4

  async function submitIWS(data, inwardId) {
    data.inwardId = inwardId

    const res = await postRequest({
      extension: RemittanceOutwardsRepository.InwardSettlement.set,
      record: JSON.stringify(data)
    })

    invalidate()
    toast.success(platformLabels.Added)
    await refetchForm(res.recordId)
  }

  async function getDefaultVAT() {
    const defaultVAT = defaultsData?.list?.find(({ key }) => key === 'vatPct')

    return parseInt(defaultVAT?.value)
  }

  const getDefaultDT = async () => {
    try {
      const res = await getRequest({
        extension: SystemRepository.UserFunction.get,
        parameters: `_userId=${userId}&_functionId=${SystemFunction.InwardTransfer}`
      })

      return res?.record?.dtId
    } catch (error) {
      stackError(error)

      return ''
    }
  }

  const chooseClient = async clientId => {
    try {
      if (clientId) {
        const res = await getRequest({
          extension: RTCLRepository.CtClientIndividual.get2,
          parameters: `_clientId=${clientId}`
        })
        formik.setFieldValue('clientId', res?.record?.clientId)
        formik.setFieldValue('clientRef', res?.record?.clientMaster?.reference)
        formik.setFieldValue('clientName', res?.record?.clientMaster?.name)
        formik.setFieldValue('category', res?.record?.clientMaster?.category)
        formik.setFieldValue('isResident', res?.record?.clientIndividual?.isResident)
        formik.setFieldValue('receiver_firstName', res?.record?.clientIndividual?.firstName)
        formik.setFieldValue('receiver_middleName', res?.record?.clientIndividual?.middleName)
        formik.setFieldValue('receiver_lastName', res?.record?.clientIndividual?.lastName)
        formik.setFieldValue('receiver_fl_firstName', res?.record?.clientIndividual?.fl_firstName)
        formik.setFieldValue('receiver_fl_middleName', res?.record?.clientIndividual?.fl_middleName)
        formik.setFieldValue('receiver_fl_lastName', res?.record?.clientIndividual?.fl_lastName)
        formik.setFieldValue('receiver_nationalityId', res?.record?.clientMaster?.nationalityId)
        formik.setFieldValue('receiver_countryId', res?.record?.clientIDView?.idCountryId)
        formik.setFieldValue('receiver_state', res?.record?.addressView?.stateName)
        formik.setFieldValue('receiver_city', res?.record?.addressView?.city)
        formik.setFieldValue('receiver_cityDistrict', res?.record?.addressView?.cityDistrict)
        formik.setFieldValue('receiver_professionId', res?.record?.clientIndividual?.professionId)
        formik.setFieldValue('receiver_sponsor', res?.record?.clientIndividual?.sponsorName)
        formik.setFieldValue('receiver_idtId', res?.record?.clientIDView?.idtId)
        formik.setFieldValue('receiver_idNo', res?.record?.clientIDView?.idNo)
        formik.setFieldValue('receiver_idIssueDate', formatDateFromApi(res?.record?.clientIDView?.idIssueDate))
        formik.setFieldValue('receiver_idExpiryDate', formatDateFromApi(res?.record?.clientIDView?.idExpiryDate))
        formik.setFieldValue('receiver_idIssueCountry', res?.record?.clientIDView?.idCountryId)
        formik.setFieldValue('receiver_birthDate', formatDateFromApi(res?.record?.clientIndividual?.birthDate))

        return {
          clientId: res?.record?.clientId,
          clientRef: res?.record?.clientMaster?.reference,
          clientName: res?.record?.clientMaster?.name,
          category: res?.record?.clientMaster?.category,
          isResident: res?.record?.clientIndividual?.isResident,
          receiver_firstName: res?.record?.clientIndividual?.firstName,
          receiver_middleName: res?.record?.clientIndividual?.middleName,
          receiver_lastName: res?.record?.clientIndividual?.lastName,
          receiver_fl_firstName: res?.record?.clientIndividual?.fl_firstName,
          receiver_fl_middleName: res?.record?.clientIndividual?.fl_middleName,
          receiver_fl_lastName: res?.record?.clientIndividual?.fl_lastName,
          receiver_nationalityId: res?.record?.clientMaster?.nationalityId,
          receiver_countryId: res?.record?.clientIDView?.idCountryId,
          receiver_state: res?.record?.addressView?.stateName,
          receiver_city: res?.record?.addressView?.city,
          receiver_cityDistrict: res?.record?.addressView?.cityDistrict,
          receiver_professionId: res?.record?.clientIndividual?.professionId,
          receiver_sponsor: res?.record?.clientIndividual?.sponsorName,
          receiver_idtId: res?.record?.clientIDView?.idtId,
          receiver_idNo: res?.record?.clientIDView?.idNo,
          receiver_idIssueDate: formatDateFromApi(res?.record?.clientIDView?.idIssueDate),
          receiver_idExpiryDate: formatDateFromApi(res?.record?.clientIDView?.idExpiryDate),
          receiver_idIssueCountry: res?.record?.clientIDView?.idCountryId,
          receiver_birthDate: formatDateFromApi(res?.record?.clientIndividual?.birthDate)
        }
      } else {
        formik.setFieldValue('clientId', null)
        formik.setFieldValue('clientRef', null)
        formik.setFieldValue('clientName', null)
        formik.setFieldValue('category', null)
        formik.setFieldValue('isResident', null)
        formik.setFieldValue('receiver_firstName', null)
        formik.setFieldValue('receiver_middleName', null)
        formik.setFieldValue('receiver_lastName', null)
        formik.setFieldValue('receiver_fl_firstName', null)
        formik.setFieldValue('receiver_fl_middleName', null)
        formik.setFieldValue('receiver_fl_lastName', null)
        formik.setFieldValue('receiver_nationalityId', null)
        formik.setFieldValue('receiver_countryId', null)
        formik.setFieldValue('receiver_state', null)
        formik.setFieldValue('receiver_city', null)
        formik.setFieldValue('receiver_cityDistrict', null)
        formik.setFieldValue('receiver_professionId', null)
        formik.setFieldValue('receiver_sponsor', null)
        formik.setFieldValue('receiver_idtId', null)
        formik.setFieldValue('receiver_idNo', null)
        formik.setFieldValue('receiver_idIssueDate', null)
        formik.setFieldValue('receiver_idExpiryDate', null)
        formik.setFieldValue('receiver_idIssueCountry', null)
        formik.setFieldValue('receiver_birthDate', null)

        return {}
      }
    } catch (error) {}
  }

  const chooseInward = async inwardId => {
    const res = await getInwardsTransfer(inwardId)

    const setFieldValues = fields => {
      Object.entries(fields).forEach(([key, value]) => {
        formik.setFieldValue(key, value)
      })
    }

    setFieldValues({
      inwardDate: res?.record?.date ? formatDateFromApi(res.record.date) : null,
      corId: res?.record?.corId,
      corRef: res?.record?.corRef,
      corName: res?.record?.corName,
      sender_firstName: res?.record?.sender_firstName || null,
      sender_lastName: res?.record?.sender_lastName || null,
      sender_middleName: res?.record?.sender_middleName || null,
      sender_nationalityId: res?.record?.sender_nationalityId,
      dispersalMode: res?.record?.dispersalMode,
      currencyId: res?.record?.currencyId,
      purposeOfTransfer: res?.record?.purposeOfTransfer,
      charges: res?.record?.charges || '',
      amount: res?.record?.amount || '',
      taxAmount: res?.record?.taxAmount || '',
      baseAmount: res?.record?.baseAmount || '',

      inw_receiver_category: res?.record?.receiver_category,
      inw_receiver_firstName: res?.record?.receiver_firstName || null,
      inw_receiver_middleName: res?.record?.receiver_middleName || null,
      inw_receiver_lastName: res?.record?.receiver_lastName || null,
      inw_receiver_fl_firstName: res?.record?.receiver_fl_firstName || null,
      inw_receiver_fl_middleName: res?.record?.receiver_fl_middleName || null,
      inw_receiver_fl_lastName: res?.record?.receiver_fl_lastName || null,
      inw_receiver_nationalityId: res?.record?.receiver_nationalityId,
      inw_dispersalMode: res?.record?.dispersalMode,
      inw_receiver_idtId: res?.record?.receiver_idtId,
      inw_receiver_idIssueDate: res?.record?.receiver_idIssueDate
        ? formatDateFromApi(res.record.receiver_idIssueDate)
        : null,
      inw_receiver_idExpiryDate: res?.record?.receiver_idExpiryDate
        ? formatDateFromApi(res.record.receiver_idExpiryDate)
        : null,
      inw_receiver_idNo: res?.record?.receiver_idNo,
      inw_receiver_accountNo: res?.record?.receiver_accountNo,
      inw_receiver_isResident: res?.record?.receiver_isResident,
      inw_receiver_address1: res?.record?.receiver_address1,
      inw_receiver_address2: res?.record?.receiver_address2
    })
  }

  async function getInwardsTransfer(recordId) {
    if (!recordId) {
      formik.setFieldValue('sourceOfIncome', '')
      formik.setFieldValue(' correspondantCurrency', '')

      return
    }

    return await getRequest({
      extension: RemittanceOutwardsRepository.InwardsTransfer.get,
      parameters: `_recordId=${recordId}`
    })
  }

  async function getInwardSettlement(recordId) {
    try {
      const res = await getRequest({
        extension: RemittanceOutwardsRepository.InwardSettlement.get,
        parameters: `_recordId=${recordId}`
      })
      formik.setValues({
        ...res?.record,
        date: formatDateFromApi(res?.record?.date)
      })

      return res
    } catch (error) {}
  }

  async function getCorCurrency(corId) {
    try {
      if (corId) {
        const res = await getRequest({
          extension: RemittanceSettingsRepository.Correspondent.get,
          parameters: `_recordId=${corId}`
        })

        formik.setFieldValue('correspondantCurrency', res?.record?.currencyId)
      } else formik.setFieldValue('correspondantCurrency', null)
    } catch (error) {}
  }

  const onClose = async () => {
    try {
      const copy = { ...formik.values }
      copy.date = formatDateToApi(copy?.date)

      const res = await postRequest({
        extension: RemittanceOutwardsRepository.InwardSettlement.close,
        record: JSON.stringify(copy)
      })

      toast.success(platformLabels.Closed)
      invalidate()
      await refetchForm(res.recordId)
    } catch (error) {}
  }

  const onReopen = async () => {
    try {
      const copy = { ...formik.values }
      copy.date = formatDateToApi(copy.date)
      copy.inwardDate = formatDateToApi(copy.inwardDate)

      const res = await postRequest({
        extension: RemittanceOutwardsRepository.InwardSettlement.reopen,
        record: JSON.stringify(copy)
      })

      toast.success(platformLabels.Reopened)
      invalidate()
      await refetchForm(res.recordId)
    } catch (error) {}
  }

  const onPost = async () => {
    try {
      const copy = { ...formik.values }
      copy.date = formatDateToApi(copy.date)
      copy.inwardDate = formatDateToApi(copy.inwardDate)

      await postRequest({
        extension: RemittanceOutwardsRepository.InwardSettlement.post,
        record: JSON.stringify(copy)
      })

      toast.success(platformLabels.Posted)
      invalidate()
      await refetchForm(res.recordId)
    } catch (error) {}
  }

  const closeInwardTransfer = async (recordId, reference, data) => {
    try {
      data.recordId = recordId
      data.reference = reference
      await postRequest({
        extension: RemittanceOutwardsRepository.InwardsTransfer.close,
        record: JSON.stringify(data)
      })
    } catch (error) {
      stackError(error)
    }
  }

  const postInwardTransfer = async (recordId, reference, data) => {
    try {
      data.recordId = recordId
      data.reference = reference
      await postRequest({
        extension: RemittanceOutwardsRepository.InwardsTransfer.post,
        record: JSON.stringify(data)
      })
    } catch (error) {
      stackError(error)
    }
  }

  async function refetchForm(recordId) {
    const res = await getInwardSettlement(recordId)
    await chooseInward(res?.record?.inwardId)
    await chooseClient(res?.record?.clientId)
    await getCorCurrency(res?.record?.corId)
  }

  const actions = [
    {
      key: 'Close',
      condition: !isClosed,
      onClick: onClose,
      disabled: isClosed || !editMode
    },
    {
      key: 'Reopen',
      condition: isClosed,
      onClick: onReopen,
      disabled: !isClosed
    },
    {
      key: 'Approval',
      condition: true,
      onClick: 'onApproval',
      disabled: !isClosed
    },
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: !isPosted
    }
  ]

  useEffect(() => {
    ;(async function () {
      getDefaultCurrency()
      if (recordId) {
        await refetchForm(recordId)
      }
    })()
  }, [])

  async function getDefaultCurrency() {
    const defaultCurrency = defaultsData?.list?.find(({ key }) => key === 'baseCurrencyId')

    formik.setFieldValue('currencyId', parseInt(defaultCurrency?.value))
  }
  const getFieldError = fieldName => mismatchedFields.includes(fieldName)

  async function getMatches(res) {
    if (!res || !res?.clientId) {
      setMismatchedFields([])

      return
    }

    const keyMapping = {
      inw_receiver_category: 'category',
      inw_receiver_firstName: 'receiver_firstName',
      inw_receiver_middleName: 'receiver_middleName',
      inw_receiver_lastName: 'receiver_lastName',
      inw_receiver_fl_firstName: 'receiver_fl_firstName',
      inw_receiver_fl_middleName: 'receiver_fl_middleName',
      inw_receiver_fl_lastName: 'receiver_fl_lastName',
      inw_receiver_nationalityId: 'receiver_nationalityId',
      inw_dispersalMode: 'dispersalMode',
      inw_receiver_idtId: 'receiver_idtId',
      inw_receiver_idExpiryDate: 'receiver_idExpiryDate',
      inw_receiver_idNo: 'receiver_idNo',
      inw_receiver_idIssueDate: 'receiver_idIssueDate',
      inw_receiver_isResident: 'isResident'
    }

    const mismatches = Object.keys(keyMapping).filter(key => {
      return formik.values[key] != res[keyMapping[key]]
    })
    setMismatchedFields(mismatches)
  }

  return (
    <FormShell
      resourceId={ResourceIds.InwardSettlement}
      form={formik}
      editMode={editMode}
      maxAccess={maxAccess}
      functionId={SystemFunction.InwardSettlement}
      actions={actions}
      onClose={onClose}
      isClosed={isClosed}
      disabledSubmit={isClosed}
    >
      <VertLayout>
        <Fixed>
          <FieldSet title={labels.header}>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <CustomTextField
                  name='reference'
                  label={labels.reference}
                  value={formik?.values?.reference}
                  maxAccess={!editMode && maxAccess}
                  maxLength='30'
                  readOnly={isClosed}
                  onChange={formik.handleChange}
                  error={formik.touched.reference && Boolean(formik.errors.reference)}
                />
              </Grid>
              <Grid item xs={3}>
                <CustomDatePicker
                  name='date'
                  required
                  label={labels.date}
                  value={formik?.values?.date}
                  readOnly={isClosed}
                  onChange={formik.setFieldValue}
                  editMode={editMode}
                  maxAccess={maxAccess}
                  onClear={() => formik.setFieldValue('date', '')}
                  error={formik.touched.date && Boolean(formik.errors.date)}
                />
              </Grid>
              <Grid item xs={3}>
                <ResourceComboBox
                  values={formik.values}
                  datasetId={DataSets.DOCUMENT_STATUS}
                  name='status'
                  label={labels.status}
                  valueField='key'
                  displayField='value'
                  readOnly
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('status', newValue?.key)
                  }}
                  error={formik.touched.status && Boolean(formik.errors.status)}
                />
              </Grid>
              <Grid item xs={3}>
                <CustomTextField
                  name='token'
                  label={labels.token}
                  value={formik?.values?.token}
                  maxAccess={maxAccess}
                  maxLength='15'
                  readOnly
                  onChange={e => formik.setFieldValue('token', e.target.value)}
                  error={formik.touched.token && Boolean(formik.errors.token)}
                />
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet title={labels.inwardDetails}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <ResourceLookup
                  endpointId={RemittanceOutwardsRepository.InwardsTransfer.snapshot2}
                  valueField='reference'
                  displayField='reference'
                  name='inwardRef'
                  secondDisplayField={false}
                  required={formik.values.interfaceId}
                  readOnly={isClosed && !formik.values.interfaceId}
                  label={labels.inwardRef}
                  form={formik}
                  onChange={async (event, newValue) => {
                    formik.setFieldValue('inwardId', newValue ? newValue.recordId : '')
                    formik.setFieldValue('inwardName', newValue ? newValue.name : '')
                    formik.setFieldValue('inwardRef', newValue ? newValue.reference : '')
                    await chooseInward(newValue?.recordId)
                    await getCorCurrency(newValue?.corId)
                  }}
                  errorCheck={'inwardId'}
                />
              </Grid>
              <Grid item xs={6}>
                <CustomDatePicker
                  name='inwardDate'
                  label={labels.inwardDate}
                  value={formik?.values?.inwardDate}
                  readOnly
                  maxAccess={maxAccess}
                  error={formik.touched.inwardDate && Boolean(formik.errors.inwardDate)}
                />
              </Grid>
              <Grid item xs={6}>
                <ResourceLookup
                  endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
                  values={formik.values}
                  valueField='reference'
                  displayField='name'
                  name='corName'
                  required={!formik.values.inwardRef}
                  readOnly={formik.values.inwardRef || isClosed}
                  valueShow='corRef'
                  label={labels.Correspondant}
                  form={formik}
                  maxAccess={maxAccess}
                  onChange={async (event, newValue) => {
                    formik.setFieldValue('interfaceId', newValue ? newValue.interfaceId : null)
                    formik.setFieldValue('corId', newValue ? newValue.recordId : null)
                    formik.setFieldValue('corRef', newValue ? newValue.reference : null)
                    formik.setFieldValue('corName', newValue ? newValue.name : null)
                    await getCorCurrency(newValue?.recordId)
                  }}
                  errorCheck={'corRef'}
                />
              </Grid>
              <Grid item xs={3}>
                <ResourceComboBox
                  endpointId={SystemRepository.Currency.qry}
                  name='correspondantCurrency'
                  label={labels.correspondantCurrency}
                  valueField='recordId'
                  displayField={['reference']}
                  values={formik.values}
                  maxAccess={maxAccess}
                  readOnly
                  error={formik.touched.correspondantCurrency && Boolean(formik.errors.correspondantCurrency)}
                />
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet title={labels.senderDetails}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <CustomTextField
                  name='sender_firstName'
                  label={labels.firstName}
                  value={formik?.values?.sender_firstName}
                  maxAccess={maxAccess}
                  required={!formik.values.inwardRef}
                  readOnly={formik.values.inwardRef || isClosed}
                  onChange={formik.handleChange}
                  error={formik.touched.sender_firstName && Boolean(formik.errors.sender_firstName)}
                />
              </Grid>
              <Grid item xs={4}>
                <CustomTextField
                  name='sender_middleName'
                  label={labels.middleName}
                  value={formik?.values?.sender_middleName}
                  maxAccess={maxAccess}
                  onChange={formik.handleChange}
                  readOnly={formik.values.inwardRef || isClosed}
                />
              </Grid>
              <Grid item xs={4}>
                <CustomTextField
                  name='sender_lastName'
                  label={labels.lastName}
                  value={formik?.values?.sender_lastName}
                  maxAccess={maxAccess}
                  required={!formik.values.inwardRef}
                  readOnly={formik.values.inwardRef || isClosed}
                  onChange={formik.handleChange}
                  error={formik.touched.sender_lastName && Boolean(formik.errors.sender_lastName)}
                />
              </Grid>
              <Grid item xs={4}>
                <ResourceComboBox
                  values={formik.values}
                  endpointId={SystemRepository.Country.qry}
                  name='sender_nationalityId'
                  label={labels.nationality}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('sender_nationalityId', newValue ? newValue.recordId : '')
                  }}
                  error={formik.touched.sender_nationalityId && Boolean(formik.errors.sender_nationalityId)}
                  maxAccess={maxAccess}
                  required={!formik.values.inwardRef}
                  readOnly={formik.values.inwardRef || isClosed}
                />
              </Grid>
              <Grid item xs={4}>
                <ResourceComboBox
                  datasetId={DataSets.ID_CATEGORY}
                  name='sender_category'
                  label={labels.category}
                  valueField='key'
                  displayField='value'
                  values={formik.values}
                  readOnly={isClosed}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('type', '')
                    formik && formik.setFieldValue('sender_category', parseInt(newValue?.key))
                  }}
                />
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet title={labels.inwardReceiverDetails}>
            <Grid item xs={3}>
              <ResourceComboBox
                values={formik.values}
                datasetId={DataSets.Category}
                name='inw_receiver_category'
                label={labels.category}
                valueField='key'
                displayField='value'
                required
                maxAccess={maxAccess}
                readOnly={true}
                error={getFieldError('inw_receiver_category')}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField
                name='inw_receiver_firstName'
                label={labels.firstName}
                value={formik?.values?.inw_receiver_firstName}
                maxAccess={maxAccess}
                readOnly={true}
                required
                error={getFieldError('inw_receiver_firstName')}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField
                name='inw_receiver_middleName'
                label={labels.middleName}
                value={formik?.values?.inw_receiver_middleName}
                maxAccess={maxAccess}
                readOnly={true}
                error={getFieldError('inw_receiver_middleName')}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField
                name='inw_receiver_lastName'
                label={labels.lastName}
                value={formik?.values?.inw_receiver_lastName}
                maxAccess={maxAccess}
                readOnly={true}
                required
                error={getFieldError('inw_receiver_lastName')}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField
                name='inw_receiver_fl_firstName'
                label={labels.fl_firstName}
                value={formik?.values?.inw_receiver_fl_firstName}
                maxAccess={maxAccess}
                readOnly={true}
                error={getFieldError('inw_receiver_fl_firstName')}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField
                name='inw_receiver_fl_middleName'
                label={labels.fl_middleName}
                value={formik?.values?.inw_receiver_fl_middleName}
                maxAccess={maxAccess}
                readOnly={true}
                maxLength='20'
                error={getFieldError('inw_receiver_fl_middleName')}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField
                name='inw_receiver_fl_lastName'
                label={labels.fl_lastName}
                value={formik?.values?.inw_receiver_fl_lastName}
                maxAccess={maxAccess}
                readOnly={true}
                error={getFieldError('inw_receiver_fl_lastName')}
              />
            </Grid>
            <Grid item xs={3}>
              <ResourceComboBox
                values={formik.values}
                endpointId={SystemRepository.Country.qry}
                name='inw_receiver_nationalityId'
                label={labels.nationality}
                valueField='recordId'
                displayField={['reference', 'name']}
                error={getFieldError('inw_receiver_nationalityId')}
                maxAccess={maxAccess}
                readOnly={true}
              />
            </Grid>
            <Grid item xs={3}>
              <ResourceComboBox
                values={formik.values}
                datasetId={DataSets.RT_Dispersal_Type}
                name='inw_dispersalMode'
                label={labels.dispersalMode}
                valueField='key'
                displayField='value'
                readOnly={true}
                maxAccess={maxAccess}
                required
                error={getFieldError('inw_dispersalMode')}
              />
            </Grid>
            <Grid item xs={3}>
              <ResourceComboBox
                values={formik.values}
                endpointId={CurrencyTradingSettingsRepository.IdTypes.qry}
                name='inw_receiver_idtId'
                label={labels.idtId}
                valueField='recordId'
                displayField={['name']}
                error={getFieldError('inw_receiver_idtId')}
                maxAccess={maxAccess}
                readOnly={true}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomDatePicker
                name='inw_receiver_idIssueDate'
                label={labels.idIssueDate}
                value={formik?.values?.inw_receiver_idIssueDate}
                editMode={editMode}
                maxAccess={maxAccess}
                readOnly={true}
                error={getFieldError('inw_receiver_idIssueDate')}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomDatePicker
                name='inw_receiver_idExpiryDate'
                label={labels.idExpiryDate}
                value={formik?.values?.inw_receiver_idExpiryDate}
                editMode={editMode}
                maxAccess={maxAccess}
                readOnly={editMode}
                error={getFieldError('inw_receiver_idExpiryDate')}
              />
            </Grid>
            <Grid item xs={3}>
              <CustomTextField
                name='inw_receiver_idNo'
                label={labels.idNo}
                value={formik?.values?.inw_receiver_idNo}
                maxAccess={maxAccess}
                readOnly={editMode}
                error={getFieldError('inw_receiver_idNo')}
              />
            </Grid>
            <Grid item xs={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='inw_receiver_isResident'
                    checked={formik.values.inw_receiver_isResident}
                    maxAccess={maxAccess}
                    disabled={true}
                  />
                }
                label={labels.isResident}
              />
            </Grid>
          </FieldSet>
          <FieldSet title={labels.receiverDetails}>
            <Grid item xs={4}>
              <ResourceLookup
                endpointId={CTCLRepository.ClientCorporate.snapshot}
                parameters={{
                  _category: 0
                }}
                valueField='reference'
                displayField='name'
                name='clientId'
                label={labels.Client}
                form={formik}
                required
                readOnly={isClosed}
                displayFieldWidth={2}
                valueShow='clientRef'
                secondValueShow='clientName'
                maxAccess={maxAccess}
                editMode={editMode}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('clientId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('clientName', newValue ? newValue.name : '')
                  formik.setFieldValue('clientRef', newValue ? newValue.reference : '')
                  const res = await chooseClient(newValue?.recordId)
                  await getMatches(res)
                }}
                errorCheck={'clientId'}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                datasetId={DataSets.ID_CATEGORY}
                name='category'
                label={labels.category}
                valueField='key'
                displayField='value'
                values={formik.values}
                required
                readOnly={formik.values.inwardRef || isClosed}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('category', parseInt(newValue?.key))
                }}
                error={formik.touched.category && Boolean(formik.errors.category)}
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                values={formik.values}
                datasetId={DataSets.CA_CASH_ACCOUNT_TYPE}
                name='dispersalMode'
                label={labels.dispersalMode}
                valueField='key'
                displayField='value'
                required={!formik.values.inwardRef}
                readOnly={formik.values.inwardRef || isClosed}
                maxAccess={maxAccess}
                onChange={(event, newValue) => {
                  formik.setFieldValue('dispersalMode', newValue?.key)
                }}
                error={formik.touched.dispersalMode && Boolean(formik.errors.dispersalMode)}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='receiver_firstName'
                label={labels.firstName}
                value={formik?.values?.receiver_firstName}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                values={formik.values}
                endpointId={SystemRepository.Country.qry}
                name='receiver_countryId'
                label={labels.country}
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                values={formik.values}
                endpointId={CurrencyTradingSettingsRepository.IdTypes.qry}
                name='receiver_idtId'
                label={labels.idtId}
                valueField='recordId'
                displayField={['name']}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='receiver_middleName'
                label={labels.middleName}
                value={formik?.values?.receiver_middleName}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='receiver_state'
                label={labels.state}
                value={formik?.values?.receiver_state}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='receiver_idNo'
                label={labels.idNo}
                value={formik?.values?.receiver_idNo}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='receiver_lastName'
                label={labels.lastName}
                value={formik?.values?.receiver_lastName}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='receiver_city'
                label={labels.city}
                value={formik?.values?.receiver_city}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomDatePicker
                name='receiver_idIssueDate'
                label={labels.idIssueDate}
                value={formik?.values?.receiver_idIssueDate}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='receiver_fl_firstName'
                label={labels.fl_firstName}
                value={formik?.values?.receiver_fl_firstName}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='receiver_cityDistrict'
                label={labels.cityDistrict}
                value={formik?.values?.receiver_cityDistrict}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <CustomDatePicker
                name='receiver_idExpiryDate'
                label={labels.idExpiryDate}
                value={formik?.values?.receiver_idExpiryDate}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='receiver_fl_middleName'
                label={labels.fl_middleName}
                value={formik?.values?.receiver_fl_middleName}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={RemittanceSettingsRepository.Profession.qry}
                label={labels.profession}
                name='receiver_professionId'
                displayField={['reference', 'name']}
                valueField='recordId'
                values={formik.values}
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={SystemRepository.Country.qry}
                label={labels.nationality}
                name='receiver_nationalityId'
                displayField={['reference', 'name']}
                valueField='recordId'
                values={formik.values}
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='receiver_fl_lastName'
                label={labels.fl_lastName}
                value={formik?.values?.receiver_fl_lastName}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                values={formik.values}
                endpointId={SystemRepository.Country.qry}
                name='receiver_idIssueCountry'
                label={labels.idIssueCountry}
                valueField='recordId'
                displayField={['reference', 'name']}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <CustomDatePicker
                name='receiver_birthDate'
                label={labels.birthDate}
                value={formik?.values?.receiver_birthDate}
                editMode
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <CustomTextField
                name='receiver_sponsor'
                label={labels.sponsor}
                value={formik?.values?.receiver_sponsor}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={4}>
              <ResourceComboBox
                endpointId={BusinessPartnerRepository.RelationTypes.qry}
                name='relationId'
                label={labels.relationId}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
                valueField='recordId'
                displayField='name'
                readOnly={isClosed}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik && formik.setFieldValue('relationId', newValue?.recordId || '')
                }}
                error={formik.touched.relationId && Boolean(formik.errors.relationId)}
              />
            </Grid>
            <Grid item xs={4}>
              <CustomCheckBox
                name='isResident'
                value={formik.values?.isResident}
                onChange={event => formik.setFieldValue('isResident', event.target.checked)}
                label={labels.isResident}
                disabled
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
          </FieldSet>
          <FieldSet title={labels.paymentDetails}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <ResourceComboBox
                  values={formik.values}
                  endpointId={SystemRepository.Currency.qry}
                  name='currencyId'
                  label={labels.currency}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                  maxAccess={maxAccess}
                  required
                  readOnly
                />
              </Grid>
              <Grid item xs={4}>
                <ResourceComboBox
                  endpointId={CurrencyTradingSettingsRepository.PurposeExchange.qry}
                  name='purposeOfTransfer'
                  label={labels.purposeOfExchange}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  columnsInDropDown={[
                    { key: 'reference', value: 'Reference' },
                    { key: 'name', value: 'Name' }
                  ]}
                  readOnly
                  values={formik.values}
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('purposeOfTransfer', newValue?.recordId || null)
                  }}
                  error={formik.touched.purposeOfTransfer && Boolean(formik.errors.purposeOfTransfer)}
                />
              </Grid>
              <Grid item xs={4}>
                <ResourceComboBox
                  endpointId={RemittanceSettingsRepository.SourceOfIncome.qry}
                  name='sourceOfIncome'
                  label={labels.sourceOfIncome}
                  valueField='recordId'
                  readOnly
                  values={formik.values}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={4}>
                <CustomNumberField
                  name='amount'
                  label={labels.amount}
                  value={formik.values.amount}
                  maxAccess={maxAccess}
                  required={!formik.values.inwardId}
                  readOnly={formik.values.inwardId || isClosed}
                  onChange={e => formik.setFieldValue('amount', e.target.value)}
                  onClear={() => formik.setFieldValue('amount', '')}
                  error={formik.touched.amount && Boolean(formik.errors.amount)}
                  maxLength={15}
                  decimalScale={2}
                />
              </Grid>
              <Grid item xs={4}>
                <CustomNumberField
                  name='netAmount'
                  label={labels.netAmount}
                  value={formik?.values?.netAmount}
                  maxAccess={maxAccess}
                  readOnly
                />
              </Grid>
              <Grid item xs={4}>
                <CustomTextArea
                  name='remarks'
                  label={labels.remarks}
                  value={formik.values.remarks}
                  maxLength='200'
                  readOnly={isClosed}
                  maxAccess={maxAccess}
                  onChange={formik.handleChange}
                  onClear={() => formik.setFieldValue('remarks', '')}
                  error={formik.touched.remarks && Boolean(formik.errors.remarks)}
                />
              </Grid>
            </Grid>
          </FieldSet>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
