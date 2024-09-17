import { Checkbox, FormControlLabel, Grid } from '@mui/material'
import { useContext, useEffect } from 'react'
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
import { useWindow } from 'src/windows'
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

export default function InwardSettlementForm({ labels, recordId, access, plantId, cashAccountId, dtId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)
  const userId = getStorageData('userData').userId

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.InwardSettlement.snapshot
  })

  const initialValues = {
    recordId: recordId || null,
    dtId: dtId ? parseInt(dtId) : null,
    date: new Date(),
    inwardDate: new Date(),
    reference: '',
    plantId: parseInt(plantId),
    cashAccountId: parseInt(cashAccountId),
    inwardId: '',
    inwardRef: null,
    corId: null,
    corRef: null,
    corName: null,
    clientId: null,
    clientRef: null,
    clientName: '',
    kycId: null,
    notes: null,
    paymentType: null,
    token: null,
    amount: '',
    charges: null,
    transferType: null,
    sender_nationalityId: null,
    sender_firstName: null,
    sender_middleName: null,
    sender_lastName: null,
    receiver_nationalityId: null,
    receiver_payoutType: null,
    commissionReceiver: null,
    purposeOfTransfer: null,
    currencyId: null,
    faxNo: null,
    commissionAgent: null,
    sourceOfIncome: null,
    receiver_relationId: null,
    interfaceId: null,
    category: null,
    sender_category: null,
    wip: 1,
    status: 1,
    releaseStatus: null
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
      inwardId: yup.string().test('is-inward-mandatory', 'Inward reference is required', function () {
        const { interfaceId } = this.parent

        return interfaceId == null || interfaceId === '' || interfaceId === undefined
      }),
      corRef: yup.string().required(),
      clientId: yup.string().required(),
      amount: yup.number().required(),
      paymentType: yup.number().required(),
      currencyId: yup.string().required(),
      transferType: yup.string().required(),
      receiver_payoutType: yup.string().required(),
      commissionAgent: yup.string().required(),
      commissionReceiver: yup.string().required(),

      inwardId: yup.string().test('is-inward-mandatory', 'Inward reference is required', function () {
        const { interfaceId } = this.parent

        return interfaceId == null || interfaceId === '' || interfaceId === undefined
      }),

      charges: yup.string().test('is-charges-mandatory', 'Charges is required', function () {
        const { inwardId } = this.parent
        if (inwardId == null || inwardId === '') return true

        return inwardId !== null && inwardId !== ''
      }),
      faxNo: yup.number().test('isTransferTypeEqual1', 'Error', function (value) {
        const { transferType } = this.parent
        console.log('check transfer ', transferType)

        return transferType !== '1' || (transferType === '1' && value !== undefined && value !== null)
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
        copy.sender_idIssueDate = copy.sender_idIssueDate ? formatDateToApi(copy?.sender_idIssueDate) : null
        copy.sender_idExpiryDate = copy.sender_idExpiryDate ? formatDateToApi(copy?.sender_idExpiryDate) : null
        copy.idIssueDate = copy.idIssueDate ? formatDateToApi(copy?.idIssueDate) : null
        copy.idExpiryDate = copy.idExpiryDate ? formatDateToApi(copy?.idExpiryDate) : null
        copy.expiryDate = copy.expiryDate ? formatDateToApi(copy?.expiryDate) : null

        if (copy.inwardId) {
          await submitIWS(copy)
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
            transferType: formik.values.transferType,
            faxNo: formik.values.faxNo,
            sender_firstName: formik.values.sender_firstName,
            sender_middleName: formik.values.sender_middleName,
            sender_lastName: formik.values.sender_lastName,
            sender_nationalityId: formik.values.sender_nationalityId,
            receiver_type: formik.values.category,
            receiver_payoutType: formik.values.receiver_payoutType,
            receiver_firstName: formik.values.receiver_firstName,
            receiver_middleName: formik.values.receiver_middleName,
            receiver_lastName: formik.values.receiver_lastName,
            dispersalMode: formik.values.paymentType,
            commissionReceiver: formik.values.commissionReceiver,
            commissionAgent: formik.values.commissionAgent,
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
          formik.setFieldValue('inwardRef', resIW?.record?.reference)
          await closeInwardTransfer(res.recordId, data)
          await postInwardTransfer(res.recordId, data)
          await submitIWS(copy)
        }
        invalidate()
        toast.success(platformLabels.Added)
      } catch (error) {
        stackError(error)
      }
    }
  })
  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip === 2

  async function submitIWS(data) {
    const res = await postRequest({
      extension: RemittanceOutwardsRepository.InwardSettlement.set,
      record: JSON.stringify(data)
    })
    await refetchForm(res.recordId)
  }

  console.log('check formik ', formik)
  async function getDefaultVAT() {
    try {
      const res = await getRequest({
        extension: SystemRepository.Defaults.get,
        parameters: `_filter=&_key=vatPct`
      })

      return parseInt(res?.record?.value)
    } catch (error) {}
  }

  const getDefaultDT = async () => {
    try {
      const res = await getRequest({
        extension: SystemRepository.UserFunction.get,
        parameters: `_userId=${userId}&_functionId=${SystemFunction.InwardSettlement}`
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
      } else {
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
      }
    } catch (error) {}
  }

  const chooseInward = async inwardId => {
    try {
      if (inwardId) {
        const res = await getInwardsTransfer(inwardId)
        formik.setFieldValue('inwardDate', formatDateFromApi(res?.record?.date))
        formik.setFieldValue('corId', res?.record?.corId)
        formik.setFieldValue('corRef', res?.record?.corRef)
        formik.setFieldValue('corName', res?.record?.corName)
        formik.setFieldValue('sender_firstName', res?.record?.sender_firstName)
        formik.setFieldValue('sender_lastName', res?.record?.sender_lastName)
        formik.setFieldValue('sender_middleName', res?.record?.sender_middleName)
        formik.setFieldValue('sender_nationalityId', res?.record?.sender_nationalityId)
        formik.setFieldValue('paymentType', res?.record?.dispersalMode)
        formik.setFieldValue('currencyId', res?.record?.currencyId)
        formik.setFieldValue('purposeOfTransfer', res?.record?.purposeOfTransfer)
        formik.setFieldValue('transferType', res?.record?.transferType)
        formik.setFieldValue('receiver_payoutType', res?.record?.receiver_payoutType)
        formik.setFieldValue('commissionReceiver', res?.record?.commissionReceiver)
        formik.setFieldValue('commissionAgent', res?.record?.commissionAgent)
        formik.setFieldValue('charges', res?.record?.charges)
      } else {
        formik.setFieldValue('inwardDate', null)
        formik.setFieldValue('corId', null)
        formik.setFieldValue('corRef', null)
        formik.setFieldValue('corName', null)
        formik.setFieldValue('sender_firstName', null)
        formik.setFieldValue('sender_lastName', null)
        formik.setFieldValue('sender_middleName', null)
        formik.setFieldValue('sender_nationalityId', null)
        formik.setFieldValue('paymentType', null)
        formik.setFieldValue('currencyId', null)
        formik.setFieldValue('purposeOfTransfer', null)
        formik.setFieldValue('sourceOfIncome', null)
        formik.setFieldValue('correspondantCurrency', null)
        formik.setFieldValue('transferType', null)
        formik.setFieldValue('receiver_payoutType', null)
        formik.setFieldValue('commissionReceiver', '')
        formik.setFieldValue('commissionAgent', '')
        formik.setFieldValue('charges', '')
      }
    } catch (error) {}
  }

  async function getInwardSettlement(recordId) {
    try {
      const res = await getRequest({
        extension: RemittanceOutwardsRepository.InwardSettlement.get,
        parameters: `_recordId=${recordId}`
      })
      formik.setValues({
        ...res.record,
        date: formatDateFromApi(res.record.date)
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
      const res = await postRequest({
        extension: RemittanceOutwardsRepository.InwardSettlement.close,
        record: JSON.stringify({
          recordId: formik.values.recordId
        })
      })
      await getInwardSettlement(res.recordId)
      toast.success(platformLabels.Closed)
      invalidate()
    } catch (error) {}
  }
  async function getInwardsTransfer(recordId) {
    try {
      return await getRequest({
        extension: RemittanceOutwardsRepository.InwardsTransfer.get,
        parameters: `_recordId=${recordId}`
      })
    } catch (error) {}
  }

  const closeInwardTransfer = async (recordId, data) => {
    try {
      data.recordId = recordId
      await postRequest({
        extension: RemittanceOutwardsRepository.InwardsTransfer.close,
        record: JSON.stringify(data)
      })
    } catch (error) {
      stackError(error)
    }
  }

  const postInwardTransfer = async (recordId, data) => {
    try {
      data.recordId = recordId
      data.reference = formik.values.inwardRef
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
    }
  ]
  useEffect(() => {
    ;(async function () {
      if (recordId) {
        await refetchForm(recordId)
      }
    })()
  }, [])

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
          <FieldSet title={labels.header} sx={{ flex: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='reference'
                      label={labels.reference}
                      value={formik?.values?.reference}
                      maxAccess={!editMode && maxAccess}
                      maxLength='30'
                      readOnly={editMode}
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
                      readOnly={editMode}
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
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet title={labels.inwardDetails} sx={{ flex: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <ResourceLookup
                      endpointId={RemittanceOutwardsRepository.InwardsTransfer.snapshot2}
                      valueField='reference'
                      displayField='reference'
                      name='inwardRef'
                      secondDisplayField={false}
                      required={formik.values.interfaceId}
                      readOnly={editMode && !formik.values.interfaceId}
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
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <ResourceLookup
                      endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
                      values={formik.values}
                      valueField='reference'
                      displayField='name'
                      name='corName'
                      required={!formik.values.inwardRef}
                      readOnly={formik.values.inwardRef}
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
                  <Grid item xs={6}>
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
                  <Grid item xs={3}>
                    <ResourceComboBox
                      values={formik.values}
                      datasetId={DataSets.transferType}
                      name='transferType'
                      label={labels.transferType}
                      valueField='key'
                      displayField='value'
                      required
                      readOnly={formik.values.inwardId}
                      maxAccess={maxAccess}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('transferType', newValue?.key)
                      }}
                      error={formik.touched.transferType && Boolean(formik.errors.transferType)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='faxNo'
                      label={labels.faxNo}
                      value={formik?.values?.faxNo}
                      maxAccess={maxAccess}
                      maxLength='30'
                      error={formik.touched.faxNo && Boolean(formik.errors.faxNo)}
                      readOnly={formik.values.inwardId}
                      required
                      hidden={formik.values.transferType != 1}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('faxNo', '')}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet title={labels.senderDetails} sx={{ flex: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='sender_firstName'
                      label={labels.firstName}
                      value={formik?.values?.sender_firstName}
                      maxAccess={maxAccess}
                      required={!formik.values.inwardRef}
                      readOnly={formik.values.inwardRef}
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
                      readOnly={formik.values.inwardRef}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='sender_lastName'
                      label={labels.lastName}
                      value={formik?.values?.sender_lastName}
                      maxAccess={maxAccess}
                      required={!formik.values.inwardRef}
                      readOnly={formik.values.inwardRef}
                      onChange={formik.handleChange}
                      error={formik.touched.sender_lastName && Boolean(formik.errors.sender_lastName)}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
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
                      readOnly={formik.values.inwardRef}
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
                      onChange={(event, newValue) => {
                        formik.setFieldValue('type', '')
                        formik && formik.setFieldValue('sender_category', parseInt(newValue?.key))
                      }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet title={labels.receiverDetails} sx={{ flex: 0 }}>
            {/*CLIENT*/}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container spacing={2}>
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
                      readOnly={editMode}
                      displayFieldWidth={2}
                      valueShow='clientRef'
                      secondValueShow='clientName'
                      maxAccess={maxAccess}
                      editMode={editMode}
                      onChange={async (event, newValue) => {
                        formik.setFieldValue('clientId', newValue ? newValue.recordId : '')
                        formik.setFieldValue('clientName', newValue ? newValue.name : '')
                        formik.setFieldValue('clientRef', newValue ? newValue.reference : '')
                        await chooseClient(newValue?.recordId)
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
                      readOnly={formik.values.inwardRef}
                      onChange={(event, newValue) => {
                        formik && formik.setFieldValue('category', parseInt(newValue?.key))
                      }}
                      error={formik.touched.category && Boolean(formik.errors.category)}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name='isResident'
                          checked={formik.values.isResident}
                          disabled
                          maxAccess={maxAccess}
                          readOnly
                        />
                      }
                      label={labels.isResident}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
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
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
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
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
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
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
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
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
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
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
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
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
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
                      values={formik.values}
                      onChange={(event, newValue) => {
                        formik && formik.setFieldValue('relationId', newValue?.recordId || '')
                      }}
                      error={formik.touched.relationId && Boolean(formik.errors.relationId)}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      values={formik.values}
                      datasetId={DataSets.receiverPayoutType}
                      name='receiver_payoutType'
                      label={labels.payoutType}
                      valueField='key'
                      displayField='value'
                      maxAccess={maxAccess}
                      required
                      readOnly={formik.values.inwardId}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('receiver_payoutType', newValue?.key)
                      }}
                      error={formik.touched.receiver_payoutType && Boolean(formik.errors.receiver_payoutType)}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomNumberField
                      name='commissionReceiver'
                      label={labels.commissionReceiver}
                      value={formik.values.commissionReceiver}
                      maxAccess={maxAccess}
                      required
                      readOnly={formik.values.inwardId}
                      onChange={e => formik.setFieldValue('commissionReceiver', e.target.value)}
                      onClear={() => formik.setFieldValue('commissionReceiver', '')}
                      error={formik.touched.commissionReceiver && Boolean(formik.errors.commissionReceiver)}
                      maxLength={12}
                      decimalScale={2}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet title={labels.paymentDetails} sx={{ flex: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      values={formik.values}
                      datasetId={DataSets.CA_CASH_ACCOUNT_TYPE}
                      name='paymentType'
                      label={labels.dispersalMode}
                      valueField='key'
                      displayField='value'
                      required={!formik.values.inwardRef}
                      readOnly={formik.values.inwardRef}
                      maxAccess={maxAccess}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('paymentType', newValue?.key)
                      }}
                      error={formik.touched.paymentType && Boolean(formik.errors.paymentType)}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      values={formik.values}
                      endpointId={SystemRepository.Currency.qry}
                      name='currencyId'
                      label={labels.currency}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('currencyId', newValue ? newValue.recordId : '')
                      }}
                      error={formik.touched.currencyId && Boolean(formik.errors.currencyId)}
                      maxAccess={maxAccess}
                      required
                      readOnly={formik.values.inwardId}
                    />
                  </Grid>

                  <Grid item xs={4}>
                    <CustomNumberField
                      name='vatAmount'
                      label={labels.vatAmount}
                      value={formik.values.vatAmount}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      onChange={e => formik.setFieldValue('vatAmount', e.target.value)}
                      onClear={() => formik.setFieldValue('vatAmount', '')}
                      error={formik.touched.vatAmount && Boolean(formik.errors.vatAmount)}
                      maxLength={15}
                      decimalScale={2}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <CustomNumberField
                      name='amount'
                      required
                      label={labels.amount}
                      value={formik.values.amount}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      onChange={e => formik.setFieldValue('amount', e.target.value)}
                      onClear={() => formik.setFieldValue('amount', '')}
                      error={formik.touched.amount && Boolean(formik.errors.amount)}
                      maxLength={15}
                      decimalScale={2}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomNumberField
                      name='charges'
                      label={labels.charges}
                      value={formik.values.charges}
                      maxAccess={maxAccess}
                      required={!formik.values.inwardId}
                      readOnly={formik.values.inwardId}
                      onChange={e => {
                        formik.setFieldValue('charges', e.target.value)
                      }}
                      onClear={() => formik.setFieldValue('charges', '')}
                      error={formik.touched.charges && Boolean(formik.errors.charges)}
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
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
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
                      name='commissionAgent'
                      label={labels.commissionAgent}
                      value={formik.values.commissionAgent}
                      maxAccess={maxAccess}
                      required
                      readOnly={formik.values.inwardId}
                      onChange={e => formik.setFieldValue('commissionAgent', e.target.value)}
                      onClear={() => formik.setFieldValue('commissionAgent', '')}
                      error={formik.touched.commissionAgent && Boolean(formik.errors.commissionAgent)}
                      maxLength={12}
                      decimalScale={2}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <CustomTextArea
                      name='remarks'
                      label={labels.remarks}
                      value={formik.values.remarks}
                      maxLength='200'
                      readOnly={editMode}
                      maxAccess={maxAccess}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('remarks', '')}
                      error={formik.touched.remarks && Boolean(formik.errors.remarks)}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </FieldSet>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
