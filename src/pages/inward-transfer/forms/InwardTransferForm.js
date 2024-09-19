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
import CloseForm from './CloseForm'

export default function InwardTransferForm({ labels, recordId, access, plantId, window, userId, dtId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const { stack } = useWindow()
  const { platformLabels } = useContext(ControlContext)

  const invalidate = useInvalidate({
    endpointId: RemittanceOutwardsRepository.InwardsTransfer.snapshot
  })

  const initialValues = {
    recordId: recordId || null,
    plantId: parseInt(plantId),
    userId: parseInt(userId),
    dtId: parseInt(dtId),
    wip: 1,
    releaseStatus: '',
    exRate: 1,
    rateCalcMethod: 1,
    taxAmount: null,
    netAmount: null,
    baseAmount: '',
    reference: '',
    date: new Date(),
    corId: null,
    corRef: '',
    corName: '',
    currencyId: null,
    status: 1,
    notes: '',
    amount: null,
    transferType: null,
    faxNo: '',
    trackingNo: '',
    sender_firstName: '',
    sender_lastName: '',
    sender_middleName: '',
    sender_nationalityId: null,
    sender_phone: null,
    sender_otherInfo: '',
    sender_countryId: null,
    sender_idtId: null,
    sender_idNo: '',
    sender_idIssuePlace: '',
    sender_idIssueDate: null,
    sender_idExpiryDate: null,
    receiver_type: '',
    receiver_riskCategory: '',
    receiver_payoutType: '',
    receiver_isResident: false,
    receiver_firstName: '',
    receiver_middleName: '',
    receiver_lastName: '',
    receiver_fl_firstName: '',
    receiver_fl_middleName: '',
    receiver_fl_lastName: '',
    receiver_phone: null,
    receiver_nationalityId: null,
    receiver_idtId: null,
    receiver_idNo: '',
    receiver_idIssueDate: null,
    receiver_idExpiryDate: null,
    receiver_idIssuePlace: null,
    receiver_accountNo: '',
    receiver_address1: '',
    receiver_address2: '',
    receiver_bank: '',
    receiver_bankBranch: '',
    receiver_ttNo: '',
    dispersalMode: '',
    paymentBank: '',
    commissionType: '',
    commissionAgent: '',
    commissionReceiver: '',
    expiryDate: null,
    sourceOfIncome: '',
    purposeOfTransfer: '',
    charges: null
  }

  const { maxAccess } = useDocumentType({
    functionId: SystemFunction.InwardTransfer,
    access,
    enabled: !recordId
  })

  const { formik } = useForm({
    maxAccess,
    initialValues,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      date: yup.date().required(),
      corId: yup.string().required(),
      currencyId: yup.string().required(),
      amount: yup.number().required(),
      transferType: yup.string().required(),
      faxNo: yup.number().test('isTransferTypeEqual1', 'Error', function (value) {
        const { transferType } = this.parent

        return transferType !== '1' || (transferType === '1' && value !== undefined && value !== null)
      }),
      sender_firstName: yup.string().required(),
      sender_lastName: yup.string().required(),
      sender_nationalityId: yup.string().required(),
      receiver_type: yup.string().required(),
      receiver_firstName: yup.string().required(),
      receiver_lastName: yup.string().required(),
      receiver_payoutType: yup.string().required(),
      commissionAgent: yup.number().required(),
      commissionReceiver: yup.number().required(),
      charges: yup.number().required(),
      dispersalMode: yup.number().required(),
      receiver_ttNo: yup.number().required()
    }),
    onSubmit: async () => {
      try {
        const copy = { ...formik.values }
        copy.date = formatDateToApi(copy?.date)
        copy.baseAmount = copy?.baseAmount === '' ? copy?.amount : copy?.baseAmount
        copy.sender_idIssueDate = copy.sender_idIssueDate ? formatDateToApi(copy?.sender_idIssueDate) : null
        copy.sender_idExpiryDate = copy.sender_idExpiryDate ? formatDateToApi(copy?.sender_idExpiryDate) : null
        copy.receiver_idIssueDate = copy.receiver_idIssueDate ? formatDateToApi(copy?.receiver_idIssueDate) : null
        copy.receiver_idExpiryDate = copy.receiver_idExpiryDate ? formatDateToApi(copy?.receiver_idExpiryDate) : null
        copy.expiryDate = copy.expiryDate ? formatDateToApi(copy?.expiryDate) : null

        const res = await postRequest({
          extension: RemittanceOutwardsRepository.InwardsTransfer.set,
          record: JSON.stringify(copy)
        })

        invalidate()
        const res2 = await getInwards(res.recordId)
        res2.record.date = formatDateFromApi(res2.record.date)
        formik.setValues(res2.record)
        toast.success(platformLabels.Added)
      } catch (error) {
        stackError(error)
      }
    }
  })
  const editMode = !!formik.values.recordId
  const isClosed = formik.values.wip === 2
  const isPosted = formik.values.status === 3

  function openCloseWindow() {
    stack({
      Component: CloseForm,
      props: {
        form: formik,
        labels,
        access,
        recordId: formik.values.recordId,
        window2: window
      },
      width: 600,
      title: platformLabels.ApproveFields
    })
  }
  async function getInwards(recordId) {
    try {
      return await getRequest({
        extension: RemittanceOutwardsRepository.InwardsTransfer.get,
        parameters: `_recordId=${recordId}`
      })
    } catch (error) {}
  }

  const onPost = async () => {
    try {
      const res = await postRequest({
        extension: RemittanceOutwardsRepository.InwardsTransfer.post,
        record: JSON.stringify(formik.values)
      })

      toast.success(platformLabels.Posted)
      invalidate()
      const res2 = await getInwards(res.recordId)
      res2.record.date = formatDateFromApi(res2.record.date)
      formik.setValues(res2.record)
    } catch (exception) {}
  }

  useEffect(() => {
    ;(async function () {
      getDefaultVAT()
      if (recordId) {
        const res = await getInwards(recordId)

        formik.setValues({
          ...res.record,
          date: formatDateFromApi(res.record.date),
          sender_idIssueDate: formatDateFromApi(res.record.sender_idIssueDate),
          sender_idExpiryDate: formatDateFromApi(res.record.sender_idExpiryDate),
          receiver_idIssueDate: formatDateFromApi(res.record.receiver_idIssueDate),
          receiver_idExpiryDate: formatDateFromApi(res.record.receiver_idExpiryDate),
          expiryDate: formatDateFromApi(res.record.expiryDate)
        })
      }
    })()
  }, [])

  async function getDefaultVAT() {
    try {
      const res = await getRequest({
        extension: SystemRepository.Defaults.get,
        parameters: `_filter=&_key=vatPct`
      })
      formik.setFieldValue('vatPct', parseInt(res?.record?.value))
    } catch (error) {}
  }

  const actions = [
    {
      key: 'Close',
      condition: true,
      onClick: openCloseWindow,
      disabled: isClosed || !editMode
    },
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      disabled: !editMode
    },
    {
      key: 'Post',
      condition: true,
      onClick: onPost,
      disabled: !isPosted
    }
  ]

  function calculateAmounts(charges) {
    const amount = formik.values.amount
    const vatPct = formik.values.vatPct

    const taxAmount = (charges * vatPct) / 100

    const netAmount = amount - charges - taxAmount

    formik.setFieldValue('taxAmount', taxAmount.toFixed(2))
    formik.setFieldValue('netAmount', netAmount.toFixed(2))
  }

  return (
    <FormShell
      resourceId={ResourceIds.InwardTransfer}
      form={formik}
      editMode={editMode}
      maxAccess={maxAccess}
      functionId={SystemFunction.InwardTransfer}
      actions={actions}
      isClosed={isClosed}
      disabledSubmit={editMode}
    >
      <VertLayout>
        <Fixed>
          <FieldSet title={labels.header} sx={{ flex: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='reference'
                      label={labels.reference}
                      value={formik?.values?.reference}
                      maxAccess={!editMode && maxAccess}
                      maxLength='15'
                      readOnly={editMode}
                      onChange={e => formik.setFieldValue('reference', e.target.value)}
                      error={formik.touched.reference && Boolean(formik.errors.reference)}
                    />
                  </Grid>
                  <Grid item xs={4}>
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
                  <Grid item xs={4}>
                    <ResourceComboBox
                      values={formik.values}
                      datasetId={DataSets.DOCUMENT_STATUS}
                      name='status'
                      label={labels.status}
                      valueField='key'
                      displayField='value'
                      readOnly={true}
                      maxAccess={maxAccess}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('status', newValue?.key)
                      }}
                      error={formik.touched.status && Boolean(formik.errors.status)}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <ResourceLookup
                      endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
                      valueField='reference'
                      displayField='name'
                      name='corId'
                      label={labels.correspondent}
                      form={formik}
                      required
                      readOnly={editMode}
                      displayFieldWidth={2}
                      valueShow='corRef'
                      secondValueShow='corName'
                      maxAccess={maxAccess}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('corId', newValue ? newValue.recordId : '')
                        formik.setFieldValue('corName', newValue ? newValue.name : '')
                        formik.setFieldValue('corRef', newValue ? newValue.reference : '')
                      }}
                      errorCheck={'corId'}
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
                      readOnly={editMode}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextArea
                      name='notes'
                      label={labels.notes}
                      value={formik.values.notes}
                      maxLength='200'
                      readOnly={editMode}
                      maxAccess={maxAccess}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('notes', '')}
                      error={formik.touched.notes && Boolean(formik.errors.notes)}
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
                      onChange={e => {
                        formik.setFieldValue('amount', e.target.value)
                        formik.values.charges && calculateAmounts(formik.values.charges)
                      }}
                      onClear={() => formik.setFieldValue('amount', '')}
                      error={formik.touched.amount && Boolean(formik.errors.amount)}
                      maxLength={15}
                      decimalScale={2}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      values={formik.values}
                      datasetId={DataSets.transferType}
                      name='transferType'
                      label={labels.transferType}
                      valueField='key'
                      displayField='value'
                      required
                      readOnly={editMode}
                      maxAccess={maxAccess}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('transferType', newValue?.key)
                      }}
                      error={formik.touched.transferType && Boolean(formik.errors.transferType)}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='faxNo'
                      label={labels.faxNo}
                      value={formik?.values?.faxNo}
                      maxAccess={maxAccess}
                      maxLength='30'
                      error={formik.touched.faxNo && Boolean(formik.errors.faxNo)}
                      readOnly={!formik.values.transferType || formik.values.transferType != 1 || editMode}
                      required={formik.values.transferType == 1}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('faxNo', '')}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container spacing={2}>
                      <Grid item xs={4}>
                        <CustomTextField
                          name='trackingNo'
                          label={labels.trackingNo}
                          value={formik?.values?.trackingNo}
                          maxAccess={maxAccess}
                          maxLength='30'
                          readOnly={editMode}
                          onChange={e => formik.setFieldValue('trackingNo', e.target.value)}
                          error={formik.touched.trackingNo && Boolean(formik.errors.trackingNo)}
                        />
                      </Grid>
                    </Grid>
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
                      label={labels.sender_firstName}
                      value={formik?.values?.sender_firstName}
                      maxAccess={maxAccess}
                      maxLength='50'
                      readOnly={editMode}
                      required
                      error={formik.touched.sender_firstName && Boolean(formik.errors.sender_firstName)}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('sender_firstName', '')}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='sender_middleName'
                      label={labels.sender_middleName}
                      value={formik?.values?.sender_middleName}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      maxLength='50'
                      error={formik.touched.sender_middleName && Boolean(formik.errors.sender_middleName)}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('sender_middleName', '')}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='sender_lastName'
                      label={labels.sender_lastName}
                      value={formik?.values?.sender_lastName}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      maxLength='50'
                      required
                      error={formik.touched.sender_lastName && Boolean(formik.errors.sender_lastName)}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('sender_lastName', '')}
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
                      label={labels.sender_nationalityId}
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
                      readOnly={editMode}
                      required
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='sender_phone'
                      label={labels.sender_phone}
                      value={formik.values.sender_phone}
                      readOnly={editMode}
                      maxLength='15'
                      phone={true}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('sender_phone', '')}
                      error={formik.touched.sender_phone && Boolean(formik.errors.sender_phone)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='sender_otherInfo'
                      label={labels.sender_otherInfo}
                      value={formik.values.sender_otherInfo}
                      maxLength='200'
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('sender_otherInfo', '')}
                      error={formik.touched.sender_otherInfo && Boolean(formik.errors.sender_otherInfo)}
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
                      name='sender_countryId'
                      label={labels.sender_countryId}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('sender_countryId', newValue ? newValue.recordId : '')
                      }}
                      error={formik.touched.sender_countryId && Boolean(formik.errors.sender_countryId)}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <ResourceComboBox
                      values={formik.values}
                      endpointId={CurrencyTradingSettingsRepository.IdTypes.qry}
                      name='sender_idtId'
                      label={labels.sender_idtId}
                      valueField='recordId'
                      displayField={['name']}
                      columnsInDropDown={[{ key: 'name', value: 'Name' }]}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('sender_idtId', newValue ? newValue.recordId : '')
                      }}
                      error={formik.touched.sender_idtId && Boolean(formik.errors.sender_idtId)}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='sender_idNo'
                      label={labels.sender_idNo}
                      value={formik?.values?.sender_idNo}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      maxLength='30'
                      error={formik.touched.sender_idNo && Boolean(formik.errors.sender_idNo)}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('sender_idNo', '')}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <CustomTextField
                      name='sender_idIssuePlace'
                      label={labels.sender_idIssuePlace}
                      value={formik.values.sender_idIssuePlace}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      onChange={e => formik.setFieldValue('sender_idIssuePlace', e.target.value)}
                      onClear={() => formik.setFieldValue('sender_idIssuePlace', '')}
                      error={formik.touched.sender_idIssuePlace && Boolean(formik.errors.sender_idIssuePlace)}
                      maxLength={40}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomDatePicker
                      name='sender_idIssueDate'
                      label={labels.sender_idIssueDate}
                      value={formik?.values?.sender_idIssueDate}
                      onChange={formik.setFieldValue}
                      editMode={editMode}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      onClear={() => formik.setFieldValue('sender_idIssueDate', '')}
                      error={formik.touched.sender_idIssueDate && Boolean(formik.errors.sender_idIssueDate)}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <CustomDatePicker
                      name='sender_idExpiryDate'
                      label={labels.sender_idExpiryDate}
                      value={formik?.values?.sender_idExpiryDate}
                      onChange={formik.setFieldValue}
                      editMode={editMode}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      onClear={() => formik.setFieldValue('sender_idExpiryDate', '')}
                      error={formik.touched.sender_idExpiryDate && Boolean(formik.errors.sender_idExpiryDate)}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet title={labels.receiverDetails} sx={{ flex: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <ResourceComboBox
                      values={formik.values}
                      datasetId={DataSets.Category}
                      name='receiver_type'
                      label={labels.receiver_type}
                      valueField='key'
                      displayField='value'
                      required
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('receiver_type', newValue?.key)
                      }}
                      error={formik.touched.receiver_type && Boolean(formik.errors.receiver_type)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomNumberField
                      name='receiver_riskCategory'
                      label={labels.receiver_riskCategory}
                      value={formik.values.receiver_riskCategory}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      onChange={e => formik.setFieldValue('receiver_riskCategory', e.target.value)}
                      onClear={() => formik.setFieldValue('receiver_riskCategory', '')}
                      error={formik.touched.receiver_riskCategory && Boolean(formik.errors.receiver_riskCategory)}
                      maxLength={5}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <ResourceComboBox
                      values={formik.values}
                      datasetId={DataSets.receiverPayoutType}
                      name='receiver_payoutType'
                      label={labels.receiver_payoutType}
                      valueField='key'
                      required
                      displayField='value'
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('receiver_payoutType', newValue?.key)
                      }}
                      error={formik.touched.receiver_payoutType && Boolean(formik.errors.receiver_payoutType)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name='receiver_isResident'
                          checked={formik.values.receiver_isResident}
                          onChange={formik.handleChange}
                          maxAccess={maxAccess}
                          disabled={editMode}
                        />
                      }
                      label={labels.receiver_isResident}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='receiver_firstName'
                      label={labels.receiver_firstName}
                      value={formik?.values?.receiver_firstName}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      maxLength='20'
                      required
                      error={formik.touched.receiver_firstName && Boolean(formik.errors.receiver_firstName)}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('receiver_firstName', '')}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='receiver_middleName'
                      label={labels.receiver_middleName}
                      value={formik?.values?.receiver_middleName}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      maxLength='20'
                      error={formik.touched.receiver_middleName && Boolean(formik.errors.receiver_middleName)}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('receiver_middleName', '')}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='receiver_lastName'
                      label={labels.receiver_lastName}
                      value={formik?.values?.receiver_lastName}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      maxLength='20'
                      required
                      error={formik.touched.receiver_lastName && Boolean(formik.errors.receiver_lastName)}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('receiver_lastName', '')}
                    />
                  </Grid>
                  <Grid item xs={3}></Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='receiver_fl_firstName'
                      label={labels.receiver_fl_firstName}
                      value={formik?.values?.receiver_fl_firstName}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      maxLength='20'
                      error={formik.touched.receiver_fl_firstName && Boolean(formik.errors.receiver_fl_firstName)}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('receiver_fl_firstName', '')}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='receiver_fl_middleName'
                      label={labels.receiver_fl_middleName}
                      value={formik?.values?.receiver_fl_middleName}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      maxLength='20'
                      error={formik.touched.receiver_fl_middleName && Boolean(formik.errors.receiver_fl_middleName)}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('receiver_fl_middleName', '')}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='receiver_fl_lastName'
                      label={labels.receiver_fl_lastName}
                      value={formik?.values?.receiver_fl_lastName}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      maxLength='20'
                      error={formik.touched.receiver_fl_lastName && Boolean(formik.errors.receiver_fl_lastName)}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('receiver_fl_lastName', '')}
                    />
                  </Grid>
                  <Grid item xs={3}></Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='receiver_phone'
                      label={labels.receiver_phone}
                      value={formik.values.receiver_phone}
                      readOnly={editMode}
                      maxLength='15'
                      phone={true}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('receiver_phone', '')}
                      error={formik.touched.receiver_phone && Boolean(formik.errors.receiver_phone)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <ResourceComboBox
                      values={formik.values}
                      endpointId={SystemRepository.Country.qry}
                      name='receiver_nationalityId'
                      label={labels.receiver_nationalityId}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('receiver_nationalityId', newValue ? newValue.recordId : '')
                      }}
                      error={formik.touched.receiver_nationalityId && Boolean(formik.errors.receiver_nationalityId)}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <ResourceComboBox
                      values={formik.values}
                      endpointId={CurrencyTradingSettingsRepository.IdTypes.qry}
                      name='receiver_idtId'
                      label={labels.receiver_idtId}
                      valueField='recordId'
                      displayField={['name']}
                      columnsInDropDown={[{ key: 'name', value: 'Name' }]}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('receiver_idtId', newValue ? newValue.recordId : '')
                      }}
                      error={formik.touched.receiver_idtId && Boolean(formik.errors.receiver_idtId)}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='receiver_idNo'
                      label={labels.receiver_idNo}
                      value={formik?.values?.receiver_idNo}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      maxLength='30'
                      error={formik.touched.receiver_idNo && Boolean(formik.errors.receiver_idNo)}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('receiver_idNo', '')}
                    />
                  </Grid>
                  <Grid item xs={3}></Grid>
                  <Grid item xs={3}></Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <CustomDatePicker
                      name='receiver_idIssueDate'
                      label={labels.receiver_idIssueDate}
                      value={formik?.values?.receiver_idIssueDate}
                      onChange={formik.setFieldValue}
                      editMode={editMode}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      onClear={() => formik.setFieldValue('receiver_idIssueDate', '')}
                      error={formik.touched.receiver_idIssueDate && Boolean(formik.errors.receiver_idIssueDate)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomDatePicker
                      name='receiver_idExpiryDate'
                      label={labels.receiver_idExpiryDate}
                      value={formik?.values?.receiver_idExpiryDate}
                      onChange={formik.setFieldValue}
                      editMode={editMode}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      onClear={() => formik.setFieldValue('receiver_idExpiryDate', '')}
                      error={formik.touched.receiver_idExpiryDate && Boolean(formik.errors.receiver_idExpiryDate)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='receiver_idIssuePlace'
                      label={labels.receiver_idIssuePlace}
                      value={formik?.values?.receiver_idIssuePlace}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      maxLength='30'
                      error={formik.touched.receiver_idIssuePlace && Boolean(formik.errors.receiver_idIssuePlace)}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('receiver_idIssuePlace', '')}
                    />
                  </Grid>
                  <Grid item xs={3}></Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='receiver_accountNo'
                      label={labels.receiver_accountNo}
                      value={formik?.values?.receiver_accountNo}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      maxLength='30'
                      error={formik.touched.receiver_accountNo && Boolean(formik.errors.receiver_accountNo)}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('receiver_accountNo', '')}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextArea
                      name='receiver_address1'
                      label={labels.receiver_address1}
                      value={formik.values.receiver_address1}
                      maxLength='100'
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('receiver_address1', '')}
                      error={formik.touched.receiver_address1 && Boolean(formik.errors.receiver_address1)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextArea
                      name='receiver_address2'
                      label={labels.receiver_address2}
                      value={formik.values.receiver_address2}
                      maxLength='100'
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('receiver_address2', '')}
                      error={formik.touched.receiver_address2 && Boolean(formik.errors.receiver_address2)}
                    />
                  </Grid>
                  <Grid item xs={3}></Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='receiver_bank'
                      label={labels.receiver_bank}
                      value={formik.values.receiver_bank}
                      maxLength='100'
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('receiver_bank', '')}
                      error={formik.touched.receiver_bank && Boolean(formik.errors.receiver_bank)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='receiver_bankBranch'
                      label={labels.receiver_bankBranch}
                      value={formik.values.receiver_bankBranch}
                      maxLength='100'
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('receiver_bankBranch', '')}
                      error={formik.touched.receiver_bankBranch && Boolean(formik.errors.receiver_bankBranch)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='receiver_ttNo'
                      label={labels.receiver_ttNo}
                      value={formik?.values?.receiver_ttNo}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      maxLength='20'
                      error={formik.touched.receiver_ttNo && Boolean(formik.errors.receiver_ttNo)}
                      onChange={formik.handleChange}
                      required
                      onClear={() => formik.setFieldValue('receiver_ttNo', '')}
                    />
                  </Grid>
                  <Grid item xs={3}></Grid>
                </Grid>
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet title={labels.paymentDetails} sx={{ flex: 0 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <ResourceComboBox
                      values={formik.values}
                      datasetId={DataSets.CA_CASH_ACCOUNT_TYPE}
                      name='dispersalMode'
                      label={labels.dispersalMode}
                      valueField='key'
                      displayField='value'
                      readOnly={editMode}
                      maxAccess={maxAccess}
                      required
                      onChange={(event, newValue) => {
                        formik.setFieldValue('dispersalMode', newValue?.key)
                      }}
                      error={formik.touched.dispersalMode && Boolean(formik.errors.dispersalMode)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='paymentBank'
                      label={labels.paymentBank}
                      value={formik?.values?.paymentBank}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      maxLength='50'
                      error={formik.touched.paymentBank && Boolean(formik.errors.paymentBank)}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('paymentBank', '')}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomNumberField
                      name='commissionType'
                      label={labels.commissionType}
                      value={formik.values.commissionType}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      onChange={e => formik.setFieldValue('commissionType', e.target.value)}
                      onClear={() => formik.setFieldValue('commissionType', '')}
                      error={formik.touched.commissionType && Boolean(formik.errors.commissionType)}
                      maxLength={5}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomNumberField
                      name='commissionAgent'
                      required
                      label={labels.commissionAgent}
                      value={formik.values.commissionAgent}
                      maxAccess={maxAccess}
                      readOnly={editMode}
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
                  <Grid item xs={3}>
                    <CustomNumberField
                      name='commissionReceiver'
                      required
                      label={labels.commissionReceiver}
                      value={formik.values.commissionReceiver}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      onChange={e => formik.setFieldValue('commissionReceiver', e.target.value)}
                      onClear={() => formik.setFieldValue('commissionReceiver', '')}
                      error={formik.touched.commissionReceiver && Boolean(formik.errors.commissionReceiver)}
                      maxLength={12}
                      decimalScale={2}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomDatePicker
                      name='expiryDate'
                      label={labels.expiryDate}
                      value={formik?.values?.expiryDate}
                      onChange={formik.setFieldValue}
                      editMode={editMode}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      onClear={() => formik.setFieldValue('expiryDate', '')}
                      error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <ResourceComboBox
                      values={formik.values}
                      endpointId={RemittanceSettingsRepository.SourceOfIncome.qry}
                      name='sourceOfIncome'
                      label={labels.sourceOfIncome}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('sourceOfIncome', newValue ? newValue.recordId : '')
                      }}
                      error={formik.touched.sourceOfIncome && Boolean(formik.errors.sourceOfIncome)}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <ResourceComboBox
                      values={formik.values}
                      endpointId={CurrencyTradingSettingsRepository.PurposeExchange.qry}
                      name='purposeOfTransfer'
                      label={labels.purposeOfTransfer}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('purposeOfTransfer', newValue ? newValue.recordId : '')
                      }}
                      error={formik.touched.purposeOfTransfer && Boolean(formik.errors.purposeOfTransfer)}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <CustomNumberField
                      name='charges'
                      required
                      label={labels.charges}
                      value={formik.values.charges}
                      maxAccess={maxAccess}
                      readOnly={editMode}
                      onChange={e => {
                        formik.setFieldValue('charges', e.target.value)
                        formik.values.amount && calculateAmounts(e.target.value)
                      }}
                      onClear={() => formik.setFieldValue('charges', '')}
                      error={formik.touched.charges && Boolean(formik.errors.charges)}
                      maxLength={12}
                      decimalScale={2}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomNumberField
                      name='taxAmount'
                      label={labels.taxAmount}
                      value={formik.values.taxAmount}
                      maxAccess={maxAccess}
                      readOnly
                      maxLength={12}
                      decimalScale={2}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomNumberField
                      name='netAmount'
                      label={labels.netAmount}
                      value={formik.values.netAmount}
                      maxAccess={maxAccess}
                      readOnly
                      maxLength={12}
                      decimalScale={2}
                    />
                  </Grid>
                  <Grid item xs={3}></Grid>
                </Grid>
              </Grid>
            </Grid>
          </FieldSet>
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
