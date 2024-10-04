import { useEffect } from 'react'
import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { CTCLRepository } from 'src/repositories/CTCLRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import { formatDateFromApi } from 'src/lib/date-helper'
import { useError } from 'src/error'
import { SystemFunction } from 'src/resources/SystemFunction'
import FieldSet from 'src/components/Shared/FieldSet'
import { DataSets } from 'src/resources/DataSets'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import FormGrid from 'src/components/form/layout/FormGrid'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'

export default function OutwardsTransferForm({ labels, maxAccess, recordId }) {
  const { getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: recordId || null,
      dtId: dtId || null,
      plantId: plantId,
      userId: userId,
      dispersalId: '',
      countryId: '',
      dispersalType: '',
      currencyId: '',
      beneficiaryId: '',
      clientId: '',
      clientRef: '',
      clientName: '',
      category: '',
      fcAmount: null,
      corId: '',
      corRef: '',
      corName: '',
      commission: null,
      defaultCommission: null,
      lcAmount: null,
      amount: 0,
      exRate: null,
      rateCalcMethod: null,
      wip: 1,
      status: 1,
      releaseStatus: '',
      reference: '',
      date: new Date(),
      professionId: '',
      poeId: '',
      status: 1,
      valueDate: new Date(),
      defaultValueDate: new Date(),
      vatAmount: null,
      taxPercent: null,
      tdAmount: 0,
      corCurrencyId: null
    },
    validateOnChange: true
  })

  const vatAmount = (formik.values.commission * formik.values.vatRate) / 100

  const amount = parseFloat(formik.values.lcAmount + (formik.values.commission + vatAmount - formik.values.tdAmount))

  const chooseClient = async (clientId, category) => {
    if (clientId && category == 1) {
      const res = await getRequest({
        extension: RTCLRepository.CtClientIndividual.get2,
        parameters: `_clientId=${clientId}`
      })

      if (!res.record?.clientRemittance) {
        stackError({
          message: `Chosen Client Has No KYC.`
        })

        return
      }

      formik.setFieldValue('firstName', res?.record?.clientIndividual?.firstName)
      formik.setFieldValue('middleName', res?.record?.clientIndividual?.middleName)
      formik.setFieldValue('lastName', res?.record?.clientIndividual?.lastName)
      formik.setFieldValue('familyName', res?.record?.clientIndividual?.familyName)
      formik.setFieldValue('fl_firstName', res?.record?.clientIndividual?.fl_firstName)
      formik.setFieldValue('fl_middleName', res?.record?.clientIndividual?.fl_middleName)
      formik.setFieldValue('fl_lastName', res?.record?.clientIndividual?.fl_lastName)
      formik.setFieldValue('fl_familyName', res?.record?.clientIndividual?.fl_familyName)
      formik.setFieldValue('professionId', res?.record?.clientIndividual?.professionId)
    }
  }

  const actions = [
    {
      key: 'Audit',
      condition: true,
      onClick: openInfo,
      disabled: !formik.values.corId
    },
    {
      key: 'GL',
      condition: true,
      onClick: 'onClickGL',
      disabled: false
    }
  ]

  async function getDefaultVAT() {
    const res = await getRequest({
      extension: SystemRepository.Defaults.get,
      parameters: `_filter=&_key=vatPct`
    })
    formik.setFieldValue('vatRate', parseInt(res.record.value))
    formik.setFieldValue('taxPercent', parseFloat(res.record.value))
  }

  async function refetchForm(recordId) {
    const res = await getRequest({
      extension: RemittanceOutwardsRepository.OutwardsTransfer.get,
      parameters: `_recordId=${recordId}`
    })
    await chooseClient(res.record.clientId, res.record.category)
    formik.setValues({
      ...res.record,
      date: formatDateFromApi(res.record.date),
      exRate: parseFloat(res.record.exRate).toFixed(5),
      defaultValueDate: formatDateFromApi(res.record.defaultValueDate),
      valueDate: formatDateFromApi(res.record.valueDate),
      bankType: res.record.interfaceId
    })
  }

  function openInfo() {
    stack({
      Component: InfoForm,
      props: {
        labels,
        formik
      },
      width: 700,
      height: 610,
      title: labels.Audit
    })
  }

  useEffect(() => {
    ;(async function () {
      if (recordId) await refetchForm(recordId)
      await getDefaultVAT()
    })()
  }, [])

  return (
    <FormShell
      resourceId={ResourceIds.OutwardsTransfer}
      form={formik}
      editMode={editMode}
      maxAccess={maxAccess}
      onClose={onClose}
      onReopen={onReopen}
      isClosed={isClosed}
      actions={actions}
      previewReport={editMode}
      functionId={SystemFunction.OutwardsTransfer}
      disabledSubmit={isClosed || editMode}
    >
      <VertLayout>
        <Grow>
          <Grid container>
            <Grid container rowGap={2} xs={12} spacing={2} sx={{ px: 2, pb: 2 }}>
              <FormGrid item hideonempty xs={3}>
                <CustomTextField
                  name='reference'
                  label={labels.Reference}
                  value={formik?.values?.reference}
                  maxAccess={!editMode && maxAccess}
                  maxLength='30'
                  readOnly={editMode}
                  onChange={formik.handleChange}
                  error={formik.touched.reference && Boolean(formik.errors.reference)}
                />
              </FormGrid>
              <FormGrid item hideonempty xs={3}>
                <CustomDatePicker
                  name='date'
                  required
                  label={labels.date}
                  value={formik?.values?.date}
                  onChange={formik.setFieldValue}
                  editMode={editMode}
                  readOnly={isClosed || isPosted || editMode}
                  maxAccess={maxAccess}
                  onClear={() => formik.setFieldValue('date', '')}
                  error={formik.touched.date && Boolean(formik.errors.date)}
                  helperText={formik.touched.date && formik.errors.date}
                />
              </FormGrid>
              <FormGrid item hideonempty xs={3}>
                <ResourceComboBox
                  datasetId={DataSets.DOCUMENT_STATUS}
                  name='status'
                  label={labels.docStatus}
                  readOnly
                  valueField='key'
                  displayField='value'
                  values={formik.values}
                  onClear={() => formik.setFieldValue('status', '')}
                  onChange={(event, newValue) => {
                    formik.setFieldValue('status', newValue?.key || '')
                  }}
                  error={formik.touched.status && Boolean(formik.errors.status)}
                />
              </FormGrid>
              <FormGrid item hideonempty xs={3}>
                <CustomDatePicker
                  name='valueDate'
                  label={labels.valueDate}
                  value={formik?.values?.valueDate}
                  onChange={formik.setFieldValue}
                  readOnly={isClosed || isPosted || editMode}
                  required
                  maxAccess={maxAccess}
                  onClear={() => formik.setFieldValue('valueDate', '')}
                  error={formik.touched.valueDate && Boolean(formik.errors.valueDate)}
                  helperText={formik.touched.valueDate && formik.errors.valueDate}
                />
              </FormGrid>
            </Grid>
            <Grid container rowGap={2} xs={4.5} sx={{ pt: 2 }}>
              <FieldSet title='Transaction Details'>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={RemittanceOutwardsRepository.Country.qry}
                    name='countryId'
                    label={labels.Country}
                    required
                    readOnly={isClosed || isPosted || editMode}
                    displayField={['countryRef', 'countryName']}
                    columnsInDropDown={[
                      { key: 'countryRef', value: 'Reference' },
                      { key: 'countryName', value: 'Name' }
                    ]}
                    valueField='countryId'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('countryId', newValue ? newValue?.countryId : '')
                      formik.setFieldValue('countryRef', newValue ? newValue?.countryRef : '')
                      formik.setFieldValue('fcAmount', '')
                      formik.setFieldValue('lcAmount', '')
                      handleSelectedProduct(null, true)
                      formik.setFieldValue('products', [])
                      if (!newValue) {
                        formik.setFieldValue('dispersalType', '')
                        formik.setFieldValue('currencyId', '')
                      }
                    }}
                    error={formik.touched.countryId && Boolean(formik.errors.countryId)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={formik.values.countryId && RemittanceOutwardsRepository.DispersalType.qry}
                    parameters={formik.values.countryId && `_countryId=${formik.values.countryId}`}
                    label={labels.DispersalType}
                    required
                    readOnly={isClosed || isPosted || !formik.values.countryId || editMode}
                    name='dispersalType'
                    displayField='dispersalTypeName'
                    valueField='dispersalType'
                    values={formik.values}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('dispersalType', newValue ? newValue?.dispersalType : '')
                      formik.setFieldValue('dispersalTypeName', newValue ? newValue?.dispersalTypeName : '')
                      formik.setFieldValue('beneficiaryId', '')
                      formik.setFieldValue('beneficiaryName', '')
                      if (!newValue) formik.setFieldValue('currencyId', '')
                    }}
                    error={formik.touched.dispersalType && Boolean(formik.errors.dispersalType)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={
                      formik.values.countryId &&
                      formik.values.dispersalType &&
                      RemittanceOutwardsRepository.Currency.qry
                    }
                    parameters={`_dispersalType=${formik.values.dispersalType}&_countryId=${formik.values.countryId}`}
                    label={labels.Currency}
                    required
                    name='currencyId'
                    displayField={['currencyRef', 'currencyName']}
                    columnsInDropDown={[
                      { key: 'currencyRef', value: 'Reference' },
                      { key: 'currencyName', value: 'Name' }
                    ]}
                    valueField='currencyId'
                    values={formik.values}
                    readOnly={!formik.values.dispersalType || isClosed || isPosted || editMode}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('currencyId', newValue?.currencyId)
                      formik.setFieldValue('currencyRef', newValue?.currencyRef)
                    }}
                    error={formik.touched.dispersalType && Boolean(formik.errors.dispersalType)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='fcAmount'
                    label={labels.fcAmount}
                    value={formik.values.fcAmount}
                    required
                    allowClear={!editMode}
                    readOnly={formik.values.lcAmount || editMode}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('fcAmount', e.target.value)}
                    onBlur={async () => {
                      if (!formik.values.lcAmount)
                        await fillProducts({
                          countryId: formik.values.countryId,
                          currencyId: formik.values.currencyId,
                          dispersalType: formik.values.dispersalType,
                          lcAmount: formik.values.lcAmount || 0,
                          fcAmount: formik.values.fcAmount || 0
                        })
                    }}
                    onClear={() => {
                      formik.setFieldValue('fcAmount', '')
                      if (!formik.values.lcAmount) {
                        handleSelectedProduct(null, true)
                        formik.setFieldValue('products', [])
                      }
                    }}
                    error={formik.touched.fcAmount && Boolean(formik.errors.fcAmount)}
                    maxLength={10}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='lcAmount'
                    label={labels.lcAmount}
                    value={formik.values.lcAmount}
                    required
                    allowClear={!editMode}
                    readOnly={formik.values.fcAmount || editMode}
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('lcAmount', e.target.value)}
                    onBlur={async () => {
                      if (!formik.values.fcAmount)
                        await fillProducts({
                          countryId: formik.values.countryId,
                          currencyId: formik.values.currencyId,
                          dispersalType: formik.values.dispersalType,
                          lcAmount: formik.values.lcAmount || 0,
                          fcAmount: formik.values.fcAmount || 0
                        })
                    }}
                    onClear={() => {
                      formik.setFieldValue('lcAmount', '')
                      if (!formik.values.fcAmount) {
                        handleSelectedProduct(null, true)
                        formik.setFieldValue('products', [])
                      }
                    }}
                    error={formik.touched.lcAmount && Boolean(formik.errors.lcAmount)}
                    maxLength={10}
                  />
                </Grid>

                <Grid container xs={12} spacing={1} sx={{ pt: 2, pl: 2 }}>
                  <Grid item xs={6}>
                    <CustomTextField
                      name='corRef'
                      label={labels.corRef}
                      value={formik.values?.corRef}
                      readOnly
                      required={formik.values.corId}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomTextField
                      name='corName'
                      label={labels.corName}
                      value={formik.values?.corName}
                      readOnly
                      required={formik.values.corId}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                </Grid>
                <Grid container xs={12} spacing={1} sx={{ pt: 2, pl: 2 }}>
                  <Grid item xs={6}>
                    <CustomNumberField
                      name='exRate'
                      label={labels.exRateMultiply}
                      value={formik.values.exRate}
                      required
                      readOnly
                      decimalScale={5}
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('exRate', e.target.value)}
                      onClear={() => formik.setFieldValue('exRate', '')}
                      error={formik.touched.exRate && Boolean(formik.errors.exRate)}
                      maxLength={10}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <CustomNumberField
                      name='exRate2'
                      decimalScale={5}
                      label={labels.exRateDivide}
                      value={formik.values?.exRate ? 1 / formik.values.exRate : ''}
                      required
                      readOnly
                      maxAccess={maxAccess}
                      onChange={e => formik.setFieldValue('exRate2', e.target.value)}
                      onClear={() => formik.setFieldValue('exRate2', '')}
                      error={formik.touched.exRate2 && Boolean(formik.errors.exRate2)}
                      maxLength={10}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='commission'
                    label={labels.commission}
                    value={formik.values.commission}
                    required
                    readOnly
                    maxAccess={maxAccess}
                    onClear={() => formik.setFieldValue('commission', '')}
                    error={formik.touched.commission && Boolean(formik.errors.commission)}
                    onChange={e => {
                      formik.setFieldValue('commission', e.target.value)
                    }}
                    maxLength={10}
                  />
                </Grid>
                <Grid container xs={12} spacing={1} sx={{ pt: 2, pl: 2 }}>
                  <Grid item xs={12}>
                    <CustomNumberField
                      name='vatAmount'
                      label={labels.vatRate}
                      value={vatAmount}
                      readOnly
                      maxAccess={maxAccess}
                      maxLength={10}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='tdAmount'
                    label={labels.discount}
                    value={formik.values.tdAmount}
                    maxAccess={maxAccess}
                    onChange={e => {
                      formik.setFieldValue('tdAmount', e.target.value)
                    }}
                    readOnly={editMode}
                    onClear={() => formik.setFieldValue('tdAmount', 0)}
                    error={formik.touched.tdAmount && Boolean(formik.errors.tdAmount)}
                    maxLength={10}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='amount'
                    label={labels.NetToPay}
                    value={amount}
                    required
                    readOnly
                    maxAccess={maxAccess}
                    onChange={e => formik.setFieldValue('amount', amount)}
                    onClear={() => formik.setFieldValue('amount', '')}
                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                    maxLength={10}
                  />
                </Grid>
              </FieldSet>
            </Grid>
            <Grid container rowGap={2} xs={7.5} sx={{ pt: 2, height: '50%' }}>
              <FieldSet title='Client Details'>
                <Grid item xs={12}>
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
                    readOnly={isClosed || isPosted || editMode}
                    displayFieldWidth={2}
                    valueShow='clientRef'
                    secondValueShow='clientName'
                    maxAccess={maxAccess}
                    editMode={editMode}
                    onChange={async (event, newValue) => {
                      if (newValue?.status == -1) {
                        stackError({
                          message: `Chosen Client Must Be Active.`
                        })

                        return
                      }

                      const today = new Date()
                      const expiryDate = new Date(parseInt(newValue?.expiryDate?.replace(/\/Date\((\d+)\)\//, '$1')))
                      if (expiryDate < today) {
                        stackError({
                          message: `Expired Client.`
                        })

                        return
                      }

                      formik.setFieldValue('clientId', newValue ? newValue.recordId : '')
                      formik.setFieldValue('clientName', newValue ? newValue.name : '')
                      formik.setFieldValue('clientRef', newValue ? newValue.reference : '')
                      formik.setFieldValue('category', newValue ? newValue.category : 1)
                      await chooseClient(newValue?.recordId, newValue?.category)
                      formik.setFieldValue('beneficiaryId', '')
                      formik.setFieldValue('beneficiaryName', '')
                    }}
                    errorCheck={'clientId'}
                  />
                </Grid>
                <Grid container xs={12} spacing={2} sx={{ pl: '10px', pt: 2 }}>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='firstName'
                      label={labels.firstName}
                      value={formik.values?.firstName}
                      readOnly
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
                      label={labels.middleName}
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
                      label={labels.lastName}
                      value={formik.values?.lastName}
                      readOnly
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
                      label={labels.familyName}
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
                <Grid container xs={12} spacing={2} sx={{ flexDirection: 'row-reverse', pl: '10px', pt: 2 }}>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='fl_firstName'
                      label={labels.flFirstName}
                      value={formik.values?.fl_firstName}
                      readOnly
                      onChange={formik.handleChange}
                      maxLength='20'
                      dir='rtl'
                      onClear={() => formik.setFieldValue('fl_firstName', '')}
                      error={formik.touched.fl_firstName && Boolean(formik.errors.fl_firstName)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='fl_middleName'
                      label={labels.flMiddleName}
                      value={formik.values?.fl_middleName}
                      readOnly
                      maxLength='20'
                      onChange={formik.handleChange}
                      dir='rtl'
                      onClear={() => formik.setFieldValue('fl_familyName', '')}
                      error={formik.touched.fl_middleName && Boolean(formik.errors.fl_middleName)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='fl_lastName'
                      label={labels.flLastName}
                      value={formik.values?.fl_lastName}
                      readOnly
                      onChange={formik.handleChange}
                      maxLength='20'
                      dir='rtl'
                      onClear={() => formik.setFieldValue('fl_lastName', '')}
                      error={formik.touched.fl_lastName && Boolean(formik.errors.fl_lastName)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <CustomTextField
                      name='fl_familyName'
                      label={labels.flFamilyName}
                      value={formik.values?.fl_familyName}
                      readOnly
                      onChange={formik.handleChange}
                      maxLength='20'
                      dir='rtl'
                      onClear={() => formik.setFieldValue('fl_familyName', '')}
                      error={formik.touched.fl_familyName && Boolean(formik.errors.fl_familyName)}
                      maxAccess={maxAccess}
                    />
                  </Grid>
                </Grid>

                <Grid container rowGap={2} xs={6} sx={{ px: 1 }}>
                  <Grid item xs={6}>
                    <ResourceComboBox
                      endpointId={RemittanceSettingsRepository.Profession.qry}
                      label={labels.profession}
                      name='professionId'
                      displayField={['reference', 'name']}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      valueField='recordId'
                      values={formik.values}
                      readOnly
                      error={formik.touched.professionId && Boolean(formik.errors.professionId)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ResourceComboBox
                      endpointId={CurrencyTradingSettingsRepository.PurposeExchange.qry}
                      name='poeId'
                      label={labels.purposeOfExchange}
                      valueField='recordId'
                      displayField={['reference', 'name']}
                      columnsInDropDown={[
                        { key: 'reference', value: 'Reference' },
                        { key: 'name', value: 'Name' }
                      ]}
                      values={formik.values}
                      onChange={(event, newValue) => {
                        formik.setFieldValue('poeId', newValue ? newValue?.recordId : '')
                      }}
                      required
                      readOnly={editMode}
                      error={formik.touched.poeId && Boolean(formik.errors.poeId)}
                      helperText={formik.touched.poeId && formik.errors.poeId}
                    />
                  </Grid>
                </Grid>
              </FieldSet>
              <Grid item xs={5} sx={{ pl: 5 }}>
                <ResourceLookup
                  endpointId={RemittanceOutwardsRepository.Beneficiary.snapshot2}
                  parameters={{
                    _clientId: formik.values.clientId,
                    _dispersalType: formik.values.dispersalType,
                    _currencyId: formik.values.currencyId
                  }}
                  valueField='name'
                  displayField='name'
                  name='beneficiaryName'
                  label={labels.Beneficiary}
                  form={formik}
                  columnsInDropDown={[
                    { key: 'name', value: 'Name' },
                    { key: 'shortName', value: 'ShortName' }
                  ]}
                  required
                  readOnly={!formik.values.clientId || !formik.values.dispersalType || isClosed || isPosted || editMode}
                  maxAccess={maxAccess}
                  editMode={editMode}
                  secondDisplayField={false}
                  onChange={async (event, newValue) => {
                    formik.setFieldValue('beneficiaryId', newValue?.beneficiaryId)
                    formik.setFieldValue('beneficiaryName', newValue?.name)
                    formik.setFieldValue('beneficiarySeqNo', newValue?.seqNo)
                  }}
                  errorCheck={'beneficiaryId'}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
