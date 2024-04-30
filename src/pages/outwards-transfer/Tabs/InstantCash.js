import { Grid } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RemittanceBankInterface } from 'src/repositories/RemittanceBankInterface'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FieldSet from 'src/components/Shared/FieldSet'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useContext, useEffect } from 'react'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import { formatDateFromApi } from 'src/lib/date-helper'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'

export default function InstantCash({ clientId, beneficiaryId, onInstantCashSubmit, cashData = [], window }) {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { labels: _labels, maxAccess } = useResourceQuery({
    datasetId: ResourceIds.InstantCash
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      payingAgent: '',
      deliveryModeId: '',
      currency: '',
      partnerReference: '',
      sourceAmount: '',
      fromCountryId: '',
      toCountryId: '',
      sourceOfFundsId: '',
      remittancePurposeId: '',
      totalTransactionAmountPerAnnum: '',
      transactionsPerAnnum: '',
      remitter: {
        cardNo: '',
        firstName: '',
        middleName: '',
        lastName: '',
        mobileNumber: '',
        phoneNumber: '',
        email: '',
        address: {
          addressLine1: '',
          addressLine2: '',
          district: '',
          city: '',
          postCode: '',
          state: '',
          country: ''
        },
        primaryId: {
          type: '',
          number: '',
          issueDate: null,
          expiryDate: null,
          placeOfIssue: ''
        },
        dateOfBirth: '',
        gender: '',
        nationality: '',
        countryOfBirth: '',
        countryOfResidence: '',
        relation: '',
        otherRelation: '',
        profession: '',
        employerName: '',
        employerStatus: ''
      },
      beneficiary: {
        cardNo: '',
        firstName: '',
        middleName: '',
        lastName: '',
        mobileNumber: '',
        phoneNumber: '',
        email: '',
        address: {
          addressLine1: '',
          addressLine2: '',
          district: '',
          city: '',
          postCode: '',
          state: '',
          country: ''
        },
        dateOfBirth: null,
        gender: '',
        nationality: '',
        countryOfBirth: '',
        bankDetails: {
          bankCode: '',
          bankName: '',
          bankAddress1: '',
          bankAccountNumber: ''
        }
      }
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      deliveryModeId: yup.string().required(' '),
      toCountryId: yup.string().required(' '),
      payingAgent: yup.string().required(' '),
      sourceOfFundsId: yup.string().required(' '),
      remittancePurposeId: yup.string().required(' '),
      sourceAmount: yup.string().required(' '),
      totalTransactionAmountPerAnnum: yup.string().required(' '),
      transactionsPerAnnum: yup.string().required(' '),
      remitter: yup.object().shape({
        profession: yup.string().required(' '),
        employerName: yup.string().required(' '),
        employerStatus: yup.string().required(' ')
      }),
      beneficiary: yup.object().shape({
        bankDetails: yup.object().shape({
          bankName: yup.string().required(' ')
        })
      })
    }),
    onSubmit: values => {
      onInstantCashSubmit(values)
      window.close()
    }
  })
  useEffect(() => {
    ;(async function () {
      try {
        if (clientId) {
          getClientInfo(clientId)
          if (beneficiaryId) getBeneficiary(clientId, beneficiaryId)
        }
        getDefaultCountry()
        if (cashData.deliveryModeId) {
          formik.setValues(cashData)
          console.log(cashData)
        }
      } catch (error) {}
    })()
  }, [])

  const getClientInfo = async clientId => {
    /*const res = await getRequest({
      extension: RTCLRepository.CtClientIndividual.get2,
      parameters: `_clientId=${clientId}`
    })
    formik.setFieldValue('remitter.firstName', res.record?.clientIndividual?.firstName || '')
    formik.setFieldValue('remitter.middleName', res.record?.clientIndividual?.middleName || '')
    formik.setFieldValue('remitter.lastName', res.record?.clientIndividual?.lastName || '')
    formik.setFieldValue('remitter.mobileNumber', res.record?.clientMaster?.cellPhone || '')
    formik.setFieldValue('remitter.dateOfBirth', formatDateFromApi(res.record?.clientIndividual?.birthDate) || '')
    formik.setFieldValue('remitter.email', res.record?.addressView?.email1 || '')
    formik.setFieldValue('remitter.gender', res.record?.clientRemittance?.genderName || '')
    console.log('test clientsss ', res.record?.clientRemittance.cobRef)
    formik.setFieldValue('remitter.countryOfBirth', res.record?.clientRemittance.cobRef)
    formik.setFieldValue('remitter.countryOfResidence', res.record?.addressView?.countryRef || '')
    formik.setFieldValue('remitter.address.country', res.record?.addressView?.countryRef || '')
    formik.setFieldValue('remitter.address.state', res.record?.addressView?.stateName || '')
    formik.setFieldValue('remitter.address.city', res.record?.addressView?.city || '')
    formik.setFieldValue('remitter.address.district', res.record?.addressView?.cityDistrictName || '')
    formik.setFieldValue('remitter.address.postCode', res.record?.addressView?.postalCode || '')
    formik.setFieldValue('remitter.nationality', res.record?.clientMaster?.nationalityRef || '')
    formik.setFieldValue('remitter.primaryId.number', res.record?.clientIDView?.idNo || '')
    formik.setFieldValue('remitter.primaryId.issueDate', formatDateFromApi(res.record?.clientIDView?.idIssueDate) || '')
    formik.setFieldValue('remitter.primaryId.expiryDate', formatDateFromApi(res.record?.clientMaster?.expiryDate) || '')
    formik.setFieldValue('remitter.primaryId.placeOfIssue', res.record?.clientIDView?.idCountryRef || '')
    if (res.record?.clientIDView?.idtId) {
      const getIdType = await getRequest({
        extension: RemittanceSettingsRepository.InterfaceMaps.get,
        parameters: `_recordId=${res.record.clientIDView.idtId}&_resourceId=${ResourceIds.IdTypes}&_interfaceId=1`
      })
      console.log('check type ', getIdType.record?.reference)
      if (getIdType.record?.reference)
        formik.setFieldValue('remitter.primaryId.type', getIdType.record?.reference || '')
    }*/
  }

  const getDefaultCountry = async () => {
    /*  const res = await getRequest({
      extension: SystemRepository.Defaults.get,
      parameters: `_filter=&_key=countryId`
    })
    if (res.record.value) {
      const countryRes = await getRequest({
        extension: SystemRepository.Country.get,
        parameters: `_recordId=${res.record.value}`
      })

      //formik.setFieldValue('fromCountryId', countryRes.record.reference)
      formik.setFieldValue('fromCountryId', 'AE')
    }*/
  }

  const getBeneficiary = async (clientId, beneficiaryId) => {
    /*  const res = await getRequest({
      extension: RemittanceOutwardsRepository.Beneficiary.get,
      parameters: `_clientId=${clientId}&_beneficiaryId=${beneficiaryId}`
    })

    const bankRes = await getRequest({
      extension: RemittanceOutwardsRepository.BeneficiaryBank.get,
      parameters: `_clientId=${clientId}&_beneficiaryId=${beneficiaryId}`
    })

    var nameArray = res.record?.benName?.split(' ')
    var first = nameArray[0] ?? ''
    var last = nameArray?.slice(1).join(' ') ?? ''

    formik.setFieldValue('beneficiary.firstName', first ?? '')
    formik.setFieldValue('beneficiary.lastName', last ?? '')
    formik.setFieldValue('beneficiary.nationality', res.record.nationalityRef)
    formik.setFieldValue('beneficiary.gender', res.record.genderName)
    formik.setFieldValue('beneficiary.countryOfBirth', res.record.cobRef)
    formik.setFieldValue('beneficiary.mobileNumber', res.record.cellPhone)
    formik.setFieldValue('beneficiary.phoneNumber', res.record.cellPhone)
    formik.setFieldValue('beneficiary.dateOfBirth', formatDateFromApi(res.record.birthDate))
    formik.setFieldValue('beneficiary.address.city', bankRes?.record?.city)
    formik.setFieldValue('beneficiary.address.addressLine1', res.record.addressLine1)
    formik.setFieldValue('beneficiary.address.addressLine2', res.record.addressLine2)
    formik.setFieldValue('beneficiary.bankDetails.bankAccountNumber', bankRes.record.IBAN)*/
  }
  console.log('formik check ', formik)

  return (
    <FormShell resourceId={ResourceIds.InstantCash} form={formik} height={480} maxAccess={maxAccess}>
      <Grid container>
        {/* First Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2, pt: 2 }}>
          <Grid hideonempty xs={12}>
            <ResourceComboBox
              endpointId={RemittanceBankInterface.Combos.qry}
              parameters={`_combo=1`}
              name='deliveryModeId'
              label={_labels.deliveryMode}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              required
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('deliveryModeId', newValue?.recordId)
                } else {
                  formik.setFieldValue('deliveryModeId', '')
                }
                formik.setFieldValue('toCountryId', '')
                formik.setFieldValue('payingAgent', '')
              }}
              maxAccess={maxAccess}
              error={formik.touched.deliveryModeId && Boolean(formik.errors.deliveryModeId)}
            />
          </Grid>
          <Grid hideonempty xs={12}>
            <ResourceComboBox
              endpointId={formik.values.deliveryModeId && RemittanceBankInterface.ReceivingCountries.qry}
              parameters={formik.values.deliveryModeId && `_deliveryMode=${formik.values.deliveryModeId}`}
              name='toCountryId'
              label={_labels.toCountry}
              valueField='recordId'
              displayField='name'
              readOnly={!formik.values.deliveryModeId}
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('toCountryId', newValue?.recordId)
                } else {
                  formik.setFieldValue('toCountryId', '')
                }
                formik.setFieldValue('payingAgent', '')
              }}
              maxAccess={maxAccess}
              error={formik.touched.toCountryId && Boolean(formik.errors.toCountryId)}
            />
          </Grid>
          <Grid hideonempty xs={12}>
            <ResourceComboBox
              endpointId={
                formik.values.deliveryModeId && formik.values.toCountryId && RemittanceBankInterface.PayingAgent.qry
              }
              parameters={
                formik.values.deliveryModeId &&
                formik.values.toCountryId &&
                `_deliveryMode=${formik.values.deliveryModeId}&_receivingCountry=${formik.values.toCountryId}`
              }
              name='payingAgent'
              label={_labels.payingAgent}
              readOnly={!(formik.values.deliveryModeId && formik.values.toCountryId)}
              valueField='recordId'
              displayField='description'
              columnsInDropDown={[
                { key: 'description', value: 'Paying Agent' },
                { key: 'payingCurrency', value: 'Paying Currency' }
              ]}
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('payingAgent', newValue?.recordId)
                  formik.setFieldValue('currency', newValue?.payingCurrency)
                } else {
                  formik.setFieldValue('payingAgent', '')
                  formik.setFieldValue('currency', '')
                }
              }}
              maxAccess={maxAccess}
              error={formik.touched.payingAgent && Boolean(formik.errors.payingAgent)}
            />
          </Grid>
          <Grid hideonempty xs={12}>
            <ResourceComboBox
              endpointId={RemittanceBankInterface.Combos.qry}
              parameters={`_combo=7`}
              name='remitter.profession'
              label={_labels.profession}
              valueField='recordId'
              displayField='name'
              value={formik.values.remitter.profession}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('remitter.profession', newValue?.recordId)
                } else {
                  formik.setFieldValue('remitter.profession', '')
                }
              }}
              maxAccess={maxAccess}
              error={formik.touched.remitter?.profession && Boolean(formik.errors.remitter?.profession)}
            />
          </Grid>
          <Grid hideonempty xs={12}>
            <ResourceComboBox
              endpointId={RemittanceBankInterface.Combos.qry}
              parameters={`_combo=5`}
              name='remittancePurposeId'
              label={_labels.remittancePurpose}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('remittancePurposeId', newValue?.recordId)
                } else {
                  formik.setFieldValue('remittancePurposeId', '')
                }
              }}
              maxAccess={maxAccess}
              error={formik.touched.remittancePurposeId && Boolean(formik.errors.remittancePurposeId)}
            />
          </Grid>
        </Grid>
        {/* Second Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2, pt: 2, height: '50%' }}>
          <Grid hideonempty xs={12}>
            <ResourceComboBox
              endpointId={RemittanceBankInterface.Combos.qry}
              parameters={`_combo=6`}
              name='sourceOfFundsId'
              label={_labels.sourceOfFunds}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('sourceOfFundsId', newValue?.recordId)
                } else {
                  formik.setFieldValue('sourceOfFundsId', '')
                }
              }}
              maxAccess={maxAccess}
              error={formik.touched.sourceOfFundsId && Boolean(formik.errors.sourceOfFundsId)}
            />
          </Grid>

          <Grid hideonempty xs={12}>
            <CustomTextField
              name='sourceAmount'
              onChange={formik.handleChange}
              label={_labels.sourceAmount}
              numberField={true}
              value={formik.values.sourceAmount}
              error={formik.touched.sourceAmount && Boolean(formik.errors.sourceAmount)}
              maxAccess={maxAccess}
              onClear={() => formik.setFieldValue('sourceAmount', '')}
            />
          </Grid>
          <Grid hideonempty xs={12}>
            <Grid item xs={12}>
              <CustomTextField
                name='totalTransactionAmountPerAnnum'
                onChange={formik.handleChange}
                label={_labels.trxPerYear}
                value={formik.values.totalTransactionAmountPerAnnum}
                error={
                  formik.touched.totalTransactionAmountPerAnnum && Boolean(formik.errors.totalTransactionAmountPerAnnum)
                }
              />
            </Grid>
          </Grid>
          <Grid hideonempty xs={12}>
            <Grid item xs={12}>
              <CustomTextField
                name='transactionsPerAnnum'
                onChange={formik.handleChange}
                label={_labels.trxPerMonth}
                value={formik.values.transactionsPerAnnum}
                error={formik.touched.transactionsPerAnnum && Boolean(formik.errors.transactionsPerAnnum)}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid container sx={{ pt: 2 }}>
        <Grid container rowGap={2} xs={6} spacing={2} sx={{ pt: 5 }}>
          <FieldSet title='Remitter'>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RemittanceBankInterface.Combos.qry}
                parameters={`_combo=2`}
                name='remitter.relation'
                label={_labels.relationship}
                valueField='recordId'
                displayField='name'
                value={formik.values.remitter.relation}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('remitter.relation', newValue?.recordId)
                  } else {
                    formik.setFieldValue('remitter.relation', '')
                  }
                }}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='otherRelation'
                onChange={formik.handleChange}
                label={_labels.otherRelation}
                value={formik.values.remitter.otherRelation}
                error={formik.touched.otherRelation && Boolean(formik.errors.otherRelation)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='remitter.employerName'
                onChange={event => formik.setFieldValue('remitter.employerName', event.target.value)}
                label={_labels.employerName}
                onClear={() => formik.setFieldValue('remitter.employerName', '')}
                value={formik.values.remitter.employerName}
                error={formik.touched.employerName && Boolean(formik.errors.employerName)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RemittanceBankInterface.Combos.qry}
                parameters={`_combo=4`}
                name='remitter.employerStatus'
                label={_labels.employerStatus}
                valueField='recordId'
                displayField='name'
                value={formik.values.remitter.employerStatus}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('remitter.employerStatus', newValue?.recordId)
                  } else {
                    formik.setFieldValue('remitter.employerStatus', '')
                  }
                }}
                maxAccess={maxAccess}
                error={formik.touched.remitter?.employerStatus && Boolean(formik.errors.remitter?.employerStatus)}
              />
            </Grid>
          </FieldSet>
        </Grid>
        <Grid container rowGap={2} xs={6} spacing={2} sx={{ pt: 5, height: '50%' }}>
          <FieldSet title='Beneficiary'>
            <Grid item xs={12}>
              <ResourceLookup
                endpointId={RemittanceBankInterface.Bank.snapshot}
                parameters={{
                  _receivingCountry: formik.values.toCountryId,
                  _payingAgent: formik.values.payingAgent,
                  _deliveryMode: formik.values.deliveryModeId
                }}
                valueField='name'
                displayField='bankName'
                name='beneficiary.bankDetails.bankName'
                label={_labels.bank}
                form={formik}
                value={formik.values.beneficiary.bankDetails.bankName}
                readOnly={!(formik.values.deliveryModeId && formik.values.toCountryId && formik.values.payingAgent)}
                maxAccess={maxAccess}
                secondDisplayField={false}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('beneficiary.bankDetails.bankName', newValue?.name)
                  formik.setFieldValue('beneficiary.bankDetails.bankCode', newValue?.recordId)
                  formik.setFieldValue('beneficiary.bankDetails.bankAddress1', newValue?.address1)
                }}
                error={
                  formik.touched.beneficiary?.bankDetails?.bankName &&
                  Boolean(formik.errors.beneficiary?.bankDetails?.bankName)
                }
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='beneficiary.postCode'
                onChange={event => formik.setFieldValue('beneficiary.address.postCode', event.target.value)}
                label={_labels.postalCode}
                numberField={true}
                value={formik.values.beneficiary.address.postCode}
                error={formik.touched.postCode && Boolean(formik.errors.postCode)}
                maxAccess={maxAccess}
              />
            </Grid>
          </FieldSet>
        </Grid>
      </Grid>
    </FormShell>
  )
}
