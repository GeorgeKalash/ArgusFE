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
import { SystemFunction } from 'src/resources/SystemFunction'
import FieldSet from 'src/components/Shared/FieldSet'
import { DataSets } from 'src/resources/DataSets'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { useForm } from 'src/hooks/form'
import { useWindow } from 'src/windows'
import AuditForm from './AuditForm'

export default function OutwardsTransferForm({ labels, maxAccess, recordId }) {
  const { getRequest } = useContext(RequestsContext)
  const { stack } = useWindow()

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      recordId: recordId || null,
      dtId: null,
      plantId: null,
      userId: null,
      dispersalId: '',
      countryId: '',
      dispersalType: '',
      currencyId: '',
      beneficiaryId: '',
      beneficiaryName: '',
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
      soaRef: '',
      owoRef: '',
      date: new Date(),
      professionId: '',
      poeId: '',
      status: 1,
      valueDate: new Date(),
      owtDate: new Date(),
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
      onClick: openAudit,
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

  function openAudit() {
    stack({
      Component: AuditForm,
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
      editMode={true}
      maxAccess={maxAccess}
      actions={actions}
      previewReport={true}
      functionId={SystemFunction.OutwardsTransfer}
      disabledSubmit={true}
    >
      <VertLayout>
        <Grow>
          <Grid container xs={12} spacing={2}>
            <Grid item xs={12}>
              <Grid container xs={12} spacing={2}>
                <Grid item xs={3}>
                  <CustomTextField
                    name='reference'
                    label={labels.Reference}
                    value={formik?.values?.reference}
                    maxAccess={false && maxAccess}
                    maxLength='30'
                    readOnly
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomTextField
                    name='owoRef'
                    label={labels.owtReference}
                    value={formik?.values?.owoRef}
                    maxAccess={maxAccess}
                    readOnly
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomDatePicker
                    name='date'
                    required
                    label={labels.date}
                    value={formik?.values?.date}
                    editMode={true}
                    readOnly
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={3}>
                  <ResourceComboBox
                    datasetId={DataSets.DOCUMENT_STATUS}
                    name='status'
                    label={labels.Status}
                    readOnly
                    valueField='key'
                    displayField='value'
                    values={formik.values}
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomDatePicker
                    name='valueDate'
                    label={labels.valueDate}
                    value={formik?.values?.valueDate}
                    readOnly
                    required
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomDatePicker
                    name='owtDate'
                    label={labels.owtDate}
                    value={formik?.values?.owtDate}
                    readOnly
                    required
                    maxAccess={maxAccess}
                  />
                </Grid>
                <Grid item xs={3}>
                  <CustomTextField
                    name='soaRef'
                    label={labels.soaRef}
                    value={formik?.values?.soaRef}
                    maxAccess={false && maxAccess}
                    maxLength='30'
                    readOnly
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container xs={12}>
                <Grid item xs={4.5}>
                  <FieldSet title='Transaction Details'>
                    <Grid container xs={12} spacing={2}>
                      <Grid item xs={12}>
                        <ResourceComboBox
                          endpointId={RemittanceOutwardsRepository.Country.qry}
                          name='countryId'
                          label={labels.Country}
                          required
                          readOnly
                          displayField={['countryRef', 'countryName']}
                          columnsInDropDown={[
                            { key: 'countryRef', value: 'Reference' },
                            { key: 'countryName', value: 'Name' }
                          ]}
                          valueField='countryId'
                          values={formik.values}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <ResourceComboBox
                          endpointId={formik.values.countryId && RemittanceOutwardsRepository.DispersalType.qry}
                          parameters={formik.values.countryId && `_countryId=${formik.values.countryId}`}
                          label={labels.DispersalType}
                          required
                          readOnly
                          name='dispersalType'
                          displayField='dispersalTypeName'
                          valueField='dispersalType'
                          values={formik.values}
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
                          readOnly
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <CustomNumberField
                          name='fcAmount'
                          label={labels.fcAmount}
                          value={formik.values.fcAmount}
                          required
                          allowClear={false}
                          readOnly
                          maxAccess={maxAccess}
                          maxLength={10}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <CustomNumberField
                          name='lcAmount'
                          label={labels.lcAmount}
                          value={formik.values.lcAmount}
                          required
                          allowClear={false}
                          readOnly
                          maxAccess={maxAccess}
                          maxLength={10}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container xs={12} spacing={2}>
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
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container xs={12} spacing={2}>
                          <Grid item xs={6}>
                            <CustomNumberField
                              name='exRate'
                              label={labels.exRateMultiply}
                              value={formik.values.exRate}
                              required
                              readOnly
                              decimalScale={5}
                              maxAccess={maxAccess}
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
                              maxLength={10}
                            />
                          </Grid>
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
                          maxLength={10}
                        />
                      </Grid>
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
                      <Grid item xs={12}>
                        <CustomNumberField
                          name='tdAmount'
                          label={labels.discount}
                          value={formik.values.tdAmount}
                          maxAccess={maxAccess}
                          readOnly
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
                          maxLength={10}
                        />
                      </Grid>
                    </Grid>
                  </FieldSet>
                </Grid>
                <Grid item xs={7.5}>
                  <FieldSet title='Client Details'>
                    <Grid container xs={12} spacing={2}>
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
                          readOnly
                          displayFieldWidth={2}
                          valueShow='clientRef'
                          secondValueShow='clientName'
                          maxAccess={maxAccess}
                          editMode={true}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container xs={12} spacing={2}>
                          <Grid item xs={3}>
                            <CustomTextField
                              name='firstName'
                              label={labels.firstName}
                              value={formik.values?.firstName}
                              readOnly
                              maxLength='20'
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <CustomTextField
                              name='middleName'
                              label={labels.middleName}
                              value={formik.values?.middleName}
                              readOnly
                              maxLength='20'
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <CustomTextField
                              name='lastName'
                              label={labels.lastName}
                              value={formik.values?.lastName}
                              readOnly
                              maxLength='20'
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <CustomTextField
                              name='familyName'
                              label={labels.familyName}
                              value={formik.values?.familyName}
                              readOnly
                              maxLength='20'
                              maxAccess={maxAccess}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container xs={12} spacing={2}>
                          <Grid item xs={3}>
                            <CustomTextField
                              name='fl_firstName'
                              label={labels.flFirstName}
                              value={formik.values?.fl_firstName}
                              readOnly
                              maxLength='20'
                              dir='rtl'
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
                              dir='rtl'
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <CustomTextField
                              name='fl_lastName'
                              label={labels.flLastName}
                              value={formik.values?.fl_lastName}
                              readOnly
                              maxLength='20'
                              dir='rtl'
                              maxAccess={maxAccess}
                            />
                          </Grid>
                          <Grid item xs={3}>
                            <CustomTextField
                              name='fl_familyName'
                              label={labels.flFamilyName}
                              value={formik.values?.fl_familyName}
                              readOnly
                              maxLength='20'
                              dir='rtl'
                              maxAccess={maxAccess}
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12}>
                        <Grid container xs={12} spacing={2}>
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
                            />
                          </Grid>
                          <Grid item xs={6}>
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
                              required
                              readOnly
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </FieldSet>
                  <Grid item xs={5}>
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
                      readOnly
                      maxAccess={maxAccess}
                      editMode={true}
                      secondDisplayField={false}
                      errorCheck={'beneficiaryId'}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
