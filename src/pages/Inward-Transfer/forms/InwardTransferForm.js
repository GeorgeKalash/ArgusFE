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
import { CashBankRepository } from 'src/repositories/CashBankRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { DataSets } from 'src/resources/DataSets'
import { ResourceIds } from 'src/resources/ResourceIds'
import { SystemFunction } from 'src/resources/SystemFunction'
import * as yup from 'yup'

export default function InwardTransferForm({ labels, recordId, access, plantId, cashAccountId, dtId }) {
  const [editMode, setEditMode] = useState(!!recordId)
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()
  const [toCurrency, setToCurrency] = useState(null)
  const [toCurrencyRef, setToCurrencyRef] = useState(null)
  const [isClosed, setIsClosed] = useState(false)
  const [isPosted, setIsPosted] = useState(true)

  const invalidate = useInvalidate({
    endpointId: CashBankRepository.CashTransfer.snapshot
  })

  const [initialValues, setInitialData] = useState({
    recordId: recordId || null,
    plantId: parseInt(plantId),
    reference: '',
    date: new Date(),
    corId: null,
    currencyId: null,
    status: null,
    notes: '',
    amount: null,
    transferType: null,
    faxNo: '',
    sender_firstName: '',
    sender_lastName: '',
    sender_middleName: '',
    senter_nationalityId: null,
    sender_phone: null,
    sender_otherInfo: '',
    sender_countryId: null,
    sender_idtId: null,
    sender_idNo: '',
    sender_idIssuePlace: '',
    sender_idIssueDate: new Date(),
    sender_idExpiryDate: new Date(),
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
    receiver_idIssueDate: new Date(),
    receiver_idExpiryDate: new Date(),
    receiver_idIssuePlace: null,
    receiver_accountNo: '',
    receiver_address1: '',
    receiver_address2: '',
    receiver_bank: '',
    receiver_bankBranch: '',
    receiver_ttNo: '',
    paymentMode: '',
    paymentBank: '',
    commissionType: '',
    commissionAgent: '',
    commissionReceiver: '',
    expiryDate: new Date(),
    sourceOfIncome: '',
    purposeOfTransfer: ''
  })

  const { maxAccess } = useDocumentType({
    functionId: SystemFunction.CashTransfer,
    access: access,
    enabled: !recordId
  })

  const { formik } = useForm({
    maxAccess,
    initialValues,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      fromCashAccountId: yup.string().required(),
      date: yup.string().required(),
      plantId: yup.string().required(' '),
      toCashAccountId: yup.string().required(),
      transfers: yup
        .array()
        .of(
          yup.object().shape({
            currencyName: yup.string().required(),
            amount: yup.string().nullable().required()
          })
        )
        .required()
    }),
    onSubmit: async values => {
      const copy = { ...values }
      delete copy.transfers
      copy.date = formatDateToApi(copy.date)
      copy.status = copy.status === '' ? 1 : copy.status
      copy.wip = copy.wip === '' ? 1 : copy.wip
      copy.baseAmount = totalLoc

      const updatedRows = formik.values.transfers.map((transferDetail, index) => {
        const seqNo = index + 1

        return {
          ...transferDetail,
          seqNo: seqNo,
          transferId: formik.values.recordId || 0
        }
      })
      if (updatedRows.length === 1 && updatedRows[0].currencyId === '') {
        stackError({
          message: `Grid not filled. Please fill the grid before saving.`
        })

        return
      }

      const resultObject = {
        header: copy,
        items: updatedRows
      }

      const res = await postRequest({
        extension: CashBankRepository.CashTransfer.set,
        record: JSON.stringify(resultObject)
      })

      if (res.recordId) {
        toast.success('Record Updated Successfully')
        formik.setFieldValue('recordId', res.recordId)
        setEditMode(true)

        const res2 = await getRequest({
          extension: CashBankRepository.CashTransfer.get,
          parameters: `_recordId=${res.recordId}`
        })

        formik.setFieldValue('reference', res2.record.reference)
        invalidate()
      }
    }
  })

  const fillCurrencyTransfer = async (transferId, data) => {
    const res = await getRequest({
      extension: CashBankRepository.CurrencyTransfer.qry,
      parameters: `_transferId=${transferId}`
    })

    const modifiedList = res.list.map(item => ({
      ...item,
      id: item.seqNo,
      amount: parseFloat(item.amount).toFixed(2),
      balance: parseFloat(item?.balance).toFixed(2) ?? 0
    }))

    formik.setValues({
      ...data,
      transfers: modifiedList
    })
  }

  const getAccView = async () => {
    if (cashAccountId) {
      const res = await getRequest({
        extension: CashBankRepository.CashAccount.get,
        parameters: `_recordId=${cashAccountId}`
      })
      if (res.record) {
        formik.setFieldValue('fromCARef', res.record.accountNo)
        formik.setFieldValue('fromCAName', res.record.name)
      }
    }
  }

  async function getBaseCurrency() {
    const res = await getRequest({
      extension: SystemRepository.Defaults.get,
      parameters: '_key=baseCurrencyId'
    })
    if (res.record.value) {
      getBaseCurrencyRef(res.record.value)
    }

    return res.record.value ?? ''
  }

  const getBaseCurrencyRef = currencyId => {
    try {
      var parameters = `_recordId=${currencyId}`
      getRequest({
        extension: SystemRepository.Currency.get,
        parameters: parameters
      }).then(res => {
        setBaseCurrencyRef(res.record.reference)
      })
    } catch (error) {}
  }

  const getCorrespondentById = async (recordId, baseCurrency, plant) => {
    if (recordId) {
      const _recordId = recordId
      const defaultParams = `_recordId=${_recordId}`
      var parameters = defaultParams

      getRequest({
        extension: RemittanceSettingsRepository.Correspondent.get,
        parameters: parameters
      }).then(async res => {
        setToCurrency(res.record.currencyId)
        setToCurrencyRef(res.record.currencyRef)

        const evalRate = await getRequest({
          extension: CurrencyTradingSettingsRepository.Defaults.get,
          parameters: '_key=ct_credit_eval_ratetype_id'
        })
        if (evalRate.record) getEXMBase(plant, res.record.currencyId, baseCurrency, evalRate.record.value)
      })
    } else {
      setToCurrency(null)
      setToCurrencyRef(null)
    }
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) {
        const res = await getRequest({
          extension: CashBankRepository.CashTransfer.get,
          parameters: `_recordId=${recordId}`
        })
        res.record.date = formatDateFromApi(res.record.date)
        setIsClosed(res.record.wip === 2 ? true : false)
        setIsPosted(res.record.status === 4 ? false : true)
        await fillCurrencyTransfer(recordId, res.record)
        const baseCurrency = await getBaseCurrency()
        getCorrespondentById(res.record.corId ?? '', baseCurrency, res.record.plantId)
      } else {
        getAccView()
      }
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.CashTransfer}
      form={formik}
      editMode={editMode}
      maxAccess={maxAccess}
      functionId={SystemFunction.CashTransfer}
      disabledSubmit={isClosed}
    >
      <VertLayout>
        <Fixed>
          <FieldSet title={labels.header} sx={{ flex: 0 }}>
            <Grid container xs={12} spacing={2}>
              <Grid item xs={4}>
                <Grid container spacing={2} xs={12}>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='reference'
                      label={labels.reference}
                      value={formik?.values?.reference}
                      maxAccess={maxAccess}
                      maxLength='15'
                      required
                      error={formik.touched.reference && Boolean(formik.errors.reference)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ResourceLookup
                      endpointId={RemittanceSettingsRepository.Correspondent.snapshot}
                      valueField='reference'
                      displayField='name'
                      name='corId'
                      label={labels.correspondent}
                      form={formik}
                      required
                      firstFieldWidth='30%'
                      displayFieldWidth={1.5}
                      valueShow='corRef'
                      secondValueShow='corName'
                      maxAccess={maxAccess}
                      editMode={editMode}
                      onChange={async (event, newValue) => {
                        if (newValue) {
                          const baseCurrency = await getBaseCurrency()
                          getCorrespondentById(newValue?.recordId, baseCurrency, formik.values.plantId)
                          formik.setFieldValue('corId', newValue?.recordId)
                          formik.setFieldValue('corName', newValue?.name || '')
                          formik.setFieldValue('corRef', newValue?.reference || '')
                        } else {
                          formik.setFieldValue('corId', null)
                          formik.setFieldValue('corName', null)
                          formik.setFieldValue('corRef', null)
                          setToCurrency(null)
                          setToCurrencyRef('')
                        }
                      }}
                      errorCheck={'corId'}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='amount'
                      required
                      label={labels.amount}
                      value={formik.values.amount}
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('amount', e.target.value)}
                      onClear={() => formik.setFieldValue('amount', '')}
                      error={formik.touched.amount && Boolean(formik.errors.amount)}
                      maxLength={15}
                      decimalScale={2}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={4}>
                <Grid container spacing={2} xs={12}>
                  <Grid item xs={12}>
                    <CustomDatePicker
                      name='date'
                      required
                      label={labels.date}
                      value={formik?.values?.date}
                      onChange={formik.setFieldValue}
                      editMode={editMode}
                      maxAccess={maxAccess}
                      onClear={() => formik.setFieldValue('date', '')}
                      error={formik.touched.date && Boolean(formik.errors.date)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ResourceComboBox
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
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ResourceComboBox
                      datasetId={DataSets.transferType}
                      name='transferType'
                      label={labels.transferType}
                      valueField='key'
                      displayField='value'
                      required
                      maxAccess={maxAccess}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('transferType', newValue?.key)
                      }}
                      error={formik.touched.transferType && Boolean(formik.errors.transferType)}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={4}>
                <Grid container spacing={2} xs={12}>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='status'
                      required
                      label={labels.status}
                      value={formik.values.status}
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('status', e.target.value)}
                      onClear={() => formik.setFieldValue('status', '')}
                      error={formik.touched.status && Boolean(formik.errors.status)}
                      maxLength={5}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextArea
                      name='notes'
                      label={labels.note}
                      value={formik.values.notes}
                      maxLength='200'
                      required
                      maxAccess={maxAccess}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('notes', '')}
                      error={formik.touched.notes && Boolean(formik.errors.notes)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='faxNo'
                      label={labels.faxNo}
                      value={formik?.values?.faxNo}
                      maxAccess={maxAccess}
                      maxLength='30'
                      error={formik.touched.faxNo && Boolean(formik.errors.faxNo)}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet title={labels.senderDetails} sx={{ flex: 0 }}>
            <Grid container xs={12} spacing={2}>
              <Grid item xs={4}>
                <Grid container spacing={2} xs={12}>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='sender_firstName'
                      label={labels.sender_firstName}
                      value={formik?.values?.sender_firstName}
                      maxAccess={maxAccess}
                      maxLength='50'
                      required
                      error={formik.touched.sender_firstName && Boolean(formik.errors.sender_firstName)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ResourceComboBox
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
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ResourceComboBox
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
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='sender_idIssuePlace'
                      label={labels.sender_idIssuePlace}
                      value={formik.values.sender_idIssuePlace}
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('sender_idIssuePlace', e.target.value)}
                      onClear={() => formik.setFieldValue('sender_idIssuePlace', '')}
                      error={formik.touched.sender_idIssuePlace && Boolean(formik.errors.sender_idIssuePlace)}
                      maxLength={30}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={4}>
                <Grid container spacing={2} xs={12}>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='sender_middleName'
                      label={labels.sender_middleName}
                      value={formik?.values?.sender_middleName}
                      maxAccess={maxAccess}
                      maxLength='50'
                      error={formik.touched.sender_middleName && Boolean(formik.errors.sender_middleName)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='sender_phone'
                      label={labels.sender_phone}
                      value={formik.values.sender_phone}
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('sender_phone', e.target.value)}
                      onClear={() => formik.setFieldValue('sender_phone', '')}
                      error={formik.touched.sender_phone && Boolean(formik.errors.sender_phone)}
                      maxLength={20}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ResourceComboBox
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
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomDatePicker
                      name='sender_idIssueDate'
                      label={labels.sender_idIssueDate}
                      value={formik?.values?.sender_idIssueDate}
                      onChange={formik.setFieldValue}
                      editMode={editMode}
                      maxAccess={maxAccess}
                      onClear={() => formik.setFieldValue('sender_idIssueDate', '')}
                      error={formik.touched.sender_idIssueDate && Boolean(formik.errors.sender_idIssueDate)}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={4}>
                <Grid container spacing={2} xs={12}>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='sender_lastName'
                      label={labels.sender_lastName}
                      value={formik?.values?.sender_lastName}
                      maxAccess={maxAccess}
                      maxLength='50'
                      required
                      error={formik.touched.sender_lastName && Boolean(formik.errors.sender_lastName)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextArea
                      name='sender_otherInfo'
                      label={labels.sender_otherInfo}
                      value={formik.values.sender_otherInfo}
                      maxLength='200'
                      maxAccess={maxAccess}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('sender_otherInfo', '')}
                      error={formik.touched.sender_otherInfo && Boolean(formik.errors.sender_otherInfo)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='sender_idNo'
                      label={labels.sender_idNo}
                      value={formik?.values?.sender_idNo}
                      maxAccess={maxAccess}
                      maxLength='30'
                      error={formik.touched.sender_idNo && Boolean(formik.errors.sender_idNo)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomDatePicker
                      name='sender_idExpiryDate'
                      required
                      label={labels.sender_idExpiryDate}
                      value={formik?.values?.sender_idExpiryDate}
                      onChange={formik.setFieldValue}
                      editMode={editMode}
                      maxAccess={maxAccess}
                      onClear={() => formik.setFieldValue('sender_idExpiryDate', '')}
                      error={formik.touched.sender_idExpiryDate && Boolean(formik.errors.sender_idExpiryDate)}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet title={labels.receiverDetails} sx={{ flex: 0 }}>
            <Grid container xs={12} spacing={2}>
              <Grid item xs={3}>
                <Grid container spacing={2} xs={12}>
                  <Grid item xs={12}>
                    <ResourceComboBox
                      datasetId={DataSets.transferType}
                      name='receiver_type'
                      label={labels.receiver_type}
                      valueField='key'
                      displayField='value'
                      required
                      maxAccess={maxAccess}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('receiver_type', newValue?.key)
                      }}
                      error={formik.touched.receiver_type && Boolean(formik.errors.receiver_type)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='receiver_firstName'
                      label={labels.receiver_firstName}
                      value={formik?.values?.receiver_firstName}
                      maxAccess={maxAccess}
                      maxLength='20'
                      required
                      error={formik.touched.receiver_firstName && Boolean(formik.errors.receiver_firstName)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='receiver_fl_firstName'
                      label={labels.receiver_fl_firstName}
                      value={formik?.values?.receiver_fl_firstName}
                      maxAccess={maxAccess}
                      maxLength='20'
                      error={formik.touched.receiver_fl_firstName && Boolean(formik.errors.receiver_fl_firstName)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='receiver_phone'
                      label={labels.receiver_phone}
                      value={formik.values.receiver_phone}
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('receiver_phone', e.target.value)}
                      onClear={() => formik.setFieldValue('receiver_phone', '')}
                      error={formik.touched.receiver_phone && Boolean(formik.errors.receiver_phone)}
                      maxLength={20}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomDatePicker
                      name='receiver_idIssueDate'
                      label={labels.receiver_idIssueDate}
                      value={formik?.values?.receiver_idIssueDate}
                      onChange={formik.setFieldValue}
                      editMode={editMode}
                      maxAccess={maxAccess}
                      onClear={() => formik.setFieldValue('receiver_idIssueDate', '')}
                      error={formik.touched.receiver_idIssueDate && Boolean(formik.errors.receiver_idIssueDate)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='receiver_accountNo'
                      label={labels.receiver_accountNo}
                      value={formik?.values?.receiver_accountNo}
                      maxAccess={maxAccess}
                      maxLength='30'
                      error={formik.touched.receiver_accountNo && Boolean(formik.errors.receiver_accountNo)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextArea
                      name='receiver_bank'
                      label={labels.receiver_bank}
                      value={formik.values.receiver_bank}
                      maxLength='100'
                      maxAccess={maxAccess}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('receiver_bank', '')}
                      error={formik.touched.receiver_bank && Boolean(formik.errors.receiver_bank)}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={3}>
                <Grid container spacing={2} xs={12}>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='receiver_riskCategory'
                      label={labels.receiver_riskCategory}
                      value={formik.values.receiver_riskCategory}
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('receiver_riskCategory', e.target.value)}
                      onClear={() => formik.setFieldValue('receiver_riskCategory', '')}
                      error={formik.touched.receiver_riskCategory && Boolean(formik.errors.receiver_riskCategory)}
                      maxLength={5}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='receiver_middleName'
                      label={labels.receiver_middleName}
                      value={formik?.values?.receiver_middleName}
                      maxAccess={maxAccess}
                      maxLength='20'
                      error={formik.touched.receiver_middleName && Boolean(formik.errors.receiver_middleName)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='receiver_fl_middleName'
                      label={labels.receiver_fl_middleName}
                      value={formik?.values?.receiver_fl_middleName}
                      maxAccess={maxAccess}
                      maxLength='20'
                      error={formik.touched.receiver_fl_middleName && Boolean(formik.errors.receiver_fl_middleName)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='receiver_nationalityId'
                      label={labels.receiver_nationalityId}
                      value={formik.values.receiver_nationalityId}
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('receiver_nationalityId', e.target.value)}
                      onClear={() => formik.setFieldValue('receiver_nationalityId', '')}
                      error={formik.touched.receiver_nationalityId && Boolean(formik.errors.receiver_nationalityId)}
                      maxLength={15}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomDatePicker
                      name='receiver_idExpiryDate'
                      label={labels.receiver_idExpiryDate}
                      value={formik?.values?.receiver_idExpiryDate}
                      onChange={formik.setFieldValue}
                      editMode={editMode}
                      maxAccess={maxAccess}
                      onClear={() => formik.setFieldValue('receiver_idExpiryDate', '')}
                      error={formik.touched.receiver_idExpiryDate && Boolean(formik.errors.receiver_idExpiryDate)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextArea
                      name='receiver_address1'
                      label={labels.receiver_address1}
                      value={formik.values.receiver_address1}
                      maxLength='100'
                      maxAccess={maxAccess}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('receiver_address1', '')}
                      error={formik.touched.receiver_address1 && Boolean(formik.errors.receiver_address1)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextArea
                      name='receiver_bankBranch'
                      label={labels.receiver_bankBranch}
                      value={formik.values.receiver_bankBranch}
                      maxLength='100'
                      maxAccess={maxAccess}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('receiver_bankBranch', '')}
                      error={formik.touched.receiver_bankBranch && Boolean(formik.errors.receiver_bankBranch)}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={3}>
                <Grid container spacing={2} xs={12}>
                  <Grid item xs={12}>
                    <ResourceComboBox
                      datasetId={DataSets.receiverPayoutType}
                      name='receiver_payoutType'
                      label={labels.receiver_payoutType}
                      valueField='key'
                      displayField='value'
                      required
                      maxAccess={maxAccess}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('receiver_payoutType', newValue?.key)
                      }}
                      error={formik.touched.receiver_payoutType && Boolean(formik.errors.receiver_payoutType)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='receiver_lastName'
                      label={labels.receiver_lastName}
                      value={formik?.values?.receiver_lastName}
                      maxAccess={maxAccess}
                      maxLength='20'
                      required
                      error={formik.touched.receiver_lastName && Boolean(formik.errors.receiver_lastName)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='receiver_fl_lastName'
                      label={labels.receiver_fl_lastName}
                      value={formik?.values?.receiver_fl_lastName}
                      maxAccess={maxAccess}
                      maxLength='20'
                      required
                      error={formik.touched.receiver_fl_lastName && Boolean(formik.errors.receiver_fl_lastName)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ResourceComboBox
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
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='receiver_idIssuePlace'
                      label={labels.receiver_idIssuePlace}
                      value={formik?.values?.receiver_idIssuePlace}
                      maxAccess={maxAccess}
                      maxLength='30'
                      error={formik.touched.receiver_idIssuePlace && Boolean(formik.errors.receiver_idIssuePlace)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextArea
                      name='receiver_address2'
                      label={labels.receiver_address2}
                      value={formik.values.receiver_address2}
                      maxLength='100'
                      maxAccess={maxAccess}
                      onChange={formik.handleChange}
                      onClear={() => formik.setFieldValue('receiver_address2', '')}
                      error={formik.touched.receiver_address2 && Boolean(formik.errors.receiver_address2)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='receiver_ttNo'
                      label={labels.receiver_ttNo}
                      value={formik?.values?.receiver_ttNo}
                      maxAccess={maxAccess}
                      maxLength='20'
                      error={formik.touched.receiver_ttNo && Boolean(formik.errors.receiver_ttNo)}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={3}>
                <Grid container spacing={2} xs={12}>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          name='receiver_isResident'
                          checked={formik.values.receiver_isResident}
                          onChange={formik.handleChange}
                          maxAccess={maxAccess}
                        />
                      }
                      label={labels.receiver_isResident}
                    />
                  </Grid>
                  <Grid item xs={12}></Grid>
                  <Grid item xs={12}></Grid>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='receiver_idNo'
                      label={labels.receiver_idNo}
                      value={formik?.values?.receiver_idNo}
                      maxAccess={maxAccess}
                      maxLength='30'
                      error={formik.touched.receiver_idNo && Boolean(formik.errors.receiver_idNo)}
                    />
                  </Grid>
                  <Grid item xs={12}></Grid>
                  <Grid item xs={12}></Grid>
                  <Grid item xs={12}></Grid>
                </Grid>
              </Grid>
            </Grid>
          </FieldSet>
          <FieldSet title={labels.paymentDetails} sx={{ flex: 0 }}>
            <Grid container xs={12} spacing={2}>
              <Grid item xs={3}>
                <Grid container spacing={2} xs={12}>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='paymentMode'
                      label={labels.paymentMode}
                      value={formik.values.paymentMode}
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('paymentMode', e.target.value)}
                      onClear={() => formik.setFieldValue('paymentMode', '')}
                      error={formik.touched.paymentMode && Boolean(formik.errors.paymentMode)}
                      maxLength={5}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='commissionReceiver'
                      required
                      label={labels.commissionReceiver}
                      value={formik.values.commissionReceiver}
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('commissionReceiver', e.target.value)}
                      onClear={() => formik.setFieldValue('commissionReceiver', '')}
                      error={formik.touched.commissionReceiver && Boolean(formik.errors.commissionReceiver)}
                      maxLength={12}
                      decimalScale={2}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={3}>
                <Grid container spacing={2} xs={12}>
                  <Grid item xs={12}>
                    <CustomTextField
                      name='paymentBank'
                      label={labels.paymentBank}
                      value={formik?.values?.paymentBank}
                      maxAccess={maxAccess}
                      maxLength='50'
                      error={formik.touched.paymentBank && Boolean(formik.errors.paymentBank)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <CustomDatePicker
                      name='expiryDate'
                      label={labels.expiryDate}
                      value={formik?.values?.expiryDate}
                      onChange={formik.setFieldValue}
                      editMode={editMode}
                      maxAccess={maxAccess}
                      onClear={() => formik.setFieldValue('expiryDate', '')}
                      error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={3}>
                <Grid container spacing={2} xs={12}>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='commissionType'
                      label={labels.commissionType}
                      value={formik.values.commissionType}
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('commissionType', e.target.value)}
                      onClear={() => formik.setFieldValue('commissionType', '')}
                      error={formik.touched.commissionType && Boolean(formik.errors.commissionType)}
                      maxLength={5}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ResourceComboBox
                      endpointId={RemittanceSettingsRepository.sourceOfIncome.qry}
                      name='sourceOfIncome'
                      label={labels.sourceOfIncome}
                      valueField='sourceOfIncome'
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
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={3}>
                <Grid container spacing={2} xs={12}>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='commissionAgent'
                      required
                      label={labels.commissionAgent}
                      value={formik.values.commissionAgent}
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('commissionAgent', e.target.value)}
                      onClear={() => formik.setFieldValue('commissionAgent', '')}
                      error={formik.touched.commissionAgent && Boolean(formik.errors.commissionAgent)}
                      maxLength={12}
                      decimalScale={2}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ResourceComboBox
                      endpointId={CurrencyTradingSettingsRepository.PurposeExchange.qry}
                      name='purposeOfTransfer'
                      label={labels.purposeOfTransfer}
                      valueField='purposeOfTransfer'
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
