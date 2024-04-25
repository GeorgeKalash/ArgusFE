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

export default function InstantCash({ clientId, beneficiaryId }) {
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
      totalTransactionAmountPerAnnum: '25000',
      transactionsPerAnnum: '200',
      remitter: [
        {
          cardNo: '',
          firstName: '',
          middleName: '',
          lastName: '',
          mobileNumber: '',
          phoneNumber: '',
          email: '',
          address: [
            {
              addressLine1: '',
              addressLine2: '',
              district: '',
              city: '',
              postCode: '',
              state: '',
              country: ''
            }
          ],
          primaryId: [
            {
              type: '',
              number: '',
              issueDate: null,
              expiryDate: null,
              placeOfIssue: ''
            }
          ],
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
        }
      ],
      beneficiary: [
        {
          cardNo: '',
          firstName: '',
          middleName: '',
          lastName: '',
          mobileNumber: '',
          phoneNumber: '',
          email: '',
          address: [
            {
              addressLine1: '',
              addressLine2: '',
              district: '',
              city: '',
              postCode: '',
              state: '',
              country: ''
            }
          ],
          dateOfBirth: '',
          gender: '',
          nationality: '',
          countryOfBirth: '',
          bankDetails: [
            {
              bankId: '',
              bankCode: '',
              bankName: '',
              bankAddress1: '',
              bankAccountNumber: ''
            }
          ]
        }
      ]
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({}),
    onSubmit: values => {
      console.log('instant check', instantCashFormik.values)
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
      } catch (error) {}
    })()
  }, [])

  const getClientInfo = async clientId => {
    const res = await getRequest({
      extension: RTCLRepository.CtClientIndividual.get2,
      parameters: `_clientId=${clientId}`
    })
    formik.setFieldValue('remitter[0].firstName', res.record?.clientIndividual?.firstName || '')
    formik.setFieldValue('remitter[0].middleName', res.record?.clientIndividual?.middleName || '')
    formik.setFieldValue('remitter[0].lastName', res.record?.clientIndividual?.lastName || '')
    formik.setFieldValue('remitter[0].mobileNumber', res.record?.clientMaster?.cellPhone || '')
    formik.setFieldValue('remitter[0].dateOfBirth', formatDateFromApi(res.record?.clientIndividual?.birthDate) || '')
    formik.setFieldValue('remitter[0].email', res.record?.addressView?.email1 || '')
    formik.setFieldValue('remitter[0].gender', res.record?.clientRemittance?.genderName || '')
    formik.setFieldValue('remitter[0].countryOfBirth', '') //res.record?.clientIDView.idCountryId (id might be ikama so we can't assume that id country is countryofBirth)
    formik.setFieldValue('remitter[0].countryOfResidence', res.record?.addressView?.countryRef || '')
    formik.setFieldValue('remitter[0].address[0].country', res.record?.addressView?.countryRef || '')
    formik.setFieldValue('remitter[0].address[0].state', res.record?.addressView?.stateName || '')
    formik.setFieldValue('remitter[0].address[0].city', res.record?.addressView?.city || '')
    formik.setFieldValue('remitter[0].address[0].district', res.record?.addressView?.cityDistrictName || '')
    formik.setFieldValue('remitter[0].address[0].postCode', res.record?.addressView?.postalCode || '')
    formik.setFieldValue('remitter[0].nationality', res.record?.clientMaster?.nationalityRef || '')
    formik.setFieldValue('remitter[0].primaryId[0].number', res.record?.clientIDView?.idNo || '')
    formik.setFieldValue(
      'remitter[0].primaryId[0].issueDate',
      formatDateFromApi(res.record?.clientIDView?.idIssueDate) || ''
    )
    formik.setFieldValue(
      'remitter[0].primaryId[0].expiryDate',
      formatDateFromApi(res.record?.clientMaster?.expiryDate) || ''
    )
    formik.setFieldValue('remitter[0].primaryId[0].placeOfIssue', res.record?.clientIDView?.idCountryRef || '')
  }

  const getDefaultCountry = async () => {
    const res = await getRequest({
      extension: SystemRepository.Defaults.get,
      parameters: `_filter=&_key=countryId`
    })
    if (res.record.value) {
      const countryRes = await getRequest({
        extension: SystemRepository.Country.get,
        parameters: `_recordId=${res.record.value}`
      })
      formik.setFieldValue('fromCountryId', countryRes.record.reference)
    }
  }

  const getBeneficiary = async (clientId, beneficiaryId) => {
    const res = await getRequest({
      extension: RemittanceOutwardsRepository.Beneficiary.get,
      parameters: `_clientId=${clientId}&_beneficiaryId=${beneficiaryId}`
    })
    formik.setFieldValue('beneficiary[0].firstName', res.record.benName)
    formik.setFieldValue('beneficiary[0].nationality', res.record.nationalityRef)
    formik.setFieldValue('beneficiary[0].gender', res.record.genderName)
    formik.setFieldValue('beneficiary[0].address[0].addressLine1', res.record.addressLine1)
    formik.setFieldValue('beneficiary[0].address[0].addressLine2', res.record.addressLine2)
  }

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
              helperText={formik.touched.deliveryModeId && formik.errors.deliveryModeId}
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
              helperText={formik.touched.toCountryId && formik.errors.toCountryId}
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
              valueField='description'
              displayField='description'
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
              helperText={formik.touched.payingAgent && formik.errors.payingAgent}
            />
          </Grid>
          <Grid hideonempty xs={12}>
            <ResourceComboBox
              endpointId={RemittanceBankInterface.Combos.qry}
              parameters={`_combo=7`}
              name='remitter[0].profession'
              label={_labels.profession}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('remitter[0].profession', newValue?.recordId)
                } else {
                  formik.setFieldValue('remitter[0].profession', '')
                }
              }}
              maxAccess={maxAccess}
              error={formik.touched.profession && Boolean(formik.errors.profession)}
              helperText={formik.touched.profession && formik.errors.profession}
            />
          </Grid>
        </Grid>
        {/* Second Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2, pt: 2, height: '50%' }}>
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
              helperText={formik.touched.remittancePurposeId && formik.errors.remittancePurposeId}
            />
          </Grid>
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
              helperText={formik.touched.sourceOfFundsId && formik.errors.sourceOfFundsId}
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
        </Grid>
      </Grid>
      <Grid container sx={{ pt: 2 }}>
        <Grid container rowGap={2} xs={6} spacing={2} sx={{ pt: 5 }}>
          <FieldSet title='Remitter'>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RemittanceBankInterface.Combos.qry}
                parameters={`_combo=2`}
                name='remitter[0].relation'
                label={_labels.relationship}
                valueField='recordId'
                displayField='name'
                values={formik.values.remitter[0].relation}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('remitter[0].relation', newValue?.recordId)
                  } else {
                    formik.setFieldValue('remitter[0].relation', '')
                  }
                }}
                maxAccess={maxAccess}
                error={formik.touched.relation && Boolean(formik.errors.relation)}
                helperText={formik.touched.relation && formik.errors.relation}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='remitter[0].otherRelation'
                onChange={formik.handleChange}
                label={_labels.otherRelation}
                value={formik.values.remitter[0].otherRelation}
                error={formik.touched.otherRelation && Boolean(formik.errors.otherRelation)}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='remitter[0].employerName'
                onChange={formik.handleChange}
                label={_labels.employerName}
                value={formik.values.remitter[0].employerName}
                error={formik.touched.employerName && Boolean(formik.errors.employerName)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RemittanceBankInterface.Combos.qry}
                parameters={`_combo=4`}
                name='remitter[0].employerStatus'
                label={_labels.employerStatus}
                valueField='recordId'
                displayField='name'
                values={formik.values.remitter[0].employerStatus}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('remitter[0].employerStatus', newValue?.name)
                  } else {
                    formik.setFieldValue('remitter[0].employerStatus', '')
                  }
                }}
                maxAccess={maxAccess}
                error={formik.touched.employerStatus && Boolean(formik.errors.employerStatus)}
                helperText={formik.touched.employerStatus && formik.errors.employerStatus}
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
                valueField='bankName'
                displayField='bankName'
                name='beneficiary[0].bankName'
                label={_labels.bank}
                form={formik}
                readOnly={!(formik.values.deliveryModeId && formik.values.toCountryId && formik.values.payingAgent)}
                maxAccess={maxAccess}
                secondDisplayField={false}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('beneficiary[0].bankDetails[0].bankId', newValue?.recordId)
                  formik.setFieldValue('beneficiary[0].bankDetails[0].bankName', newValue?.bankName)
                  formik.setFieldValue('beneficiary[0].bankDetails[0].bankCode', newValue?.bankName)
                  formik.setFieldValue('beneficiary[0].bankDetails[0].bankAddress1', newValue?.bankName)
                  formik.setFieldValue('beneficiary[0].bankDetails[0].bankAccountNumber', newValue?.bankName)
                }}
                errorCheck={'bankId'}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='beneficiary[0].postalCode'
                onChange={formik.handleChange}
                label={_labels.postalCode}
                numberField={true}
                value={formik.values.beneficiary[0].address[0].postalCode}
                error={formik.touched.postalCode && Boolean(formik.errors.postalCode)}
                maxAccess={maxAccess}
              />
            </Grid>
          </FieldSet>
        </Grid>
      </Grid>
    </FormShell>
  )
}
