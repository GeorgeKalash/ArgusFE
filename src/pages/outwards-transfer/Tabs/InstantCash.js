import { FormControl, Grid, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { DataSets } from 'src/resources/DataSets'
import { useFormik } from 'formik'
import { RemittanceBankInterface } from 'src/repositories/RemittanceBankInterface'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FieldSet from 'src/components/Shared/FieldSet'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { useContext, useEffect } from 'react'
import { RTCLRepository } from 'src/repositories/RTCLRepository'
import { RequestsContext } from 'src/providers/RequestsContext'
import { formatDateFromApi } from 'src/lib/date-helper'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'

export default function InstantCash({ clientId, beneficiaryId }) {
  const { getRequest, postRequest } = useContext(RequestsContext)

  const { labels: _labels, maxAccess } = useResourceQuery({
    datasetId: ResourceIds.InstantCash
  })

  const formik = useFormik({
    //maxAccess,
    initialValues: {
      payingAgent: '',
      deliveryModeId: '',
      currency: '',
      partnerReference: '',
      sourceAmount: '',
      fromCountryId: '',
      fromCountryName: '',
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
              idtName: '',
              number: '',
              issueDate: null,
              expiryDate: null,
              placeOfIssue: '',
              placeOfIssueName: ''
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
    validationSchema: yup.object({
      // name: yup.string().required(' ')
    })
  })
  useEffect(() => {
    ;(async function () {
      try {
        if (clientId) {
          getClientInfo(clientId)
          if (beneficiaryId) getBeneficiary(clientId, beneficiaryId)
        }
      } catch (error) {}
    })()
  }, [])

  const getClientInfo = async clientId => {
    const res = await getRequest({
      extension: RTCLRepository.CtClientIndividual.get,
      parameters: `_clientId=${clientId}`
    })
    formik.setFieldValue('remitter[0].firstName', res.record.clientIndividual.firstName)
    formik.setFieldValue('remitter[0].mobileNumber', res.record.clientMaster.cellPhone)

    formik.setFieldValue('remitter[0].primaryId[0].number', res.record.clientIDView.idNo)
    formik.setFieldValue('remitter[0].primaryId[0].issueDate', formatDateFromApi(res.record.clientIDView.idIssueDate))
    formik.setFieldValue('remitter[0].primaryId[0].expiryDate', formatDateFromApi(res.record.clientIDView.idExpiryDate))
    formik.setFieldValue('remitter[0].primaryId[0].placeOfIssue', res.record.clientIDView.idCountryId)
    formik.setFieldValue('remitter[0].primaryId[0].placeOfIssueName', res.record.clientIDView.idCountryName)
  }

  const getBeneficiary = async (clientId, beneficiaryId) => {
    const res = await getRequest({
      extension: RemittanceOutwardsRepository.BeneficiaryBank.get,
      parameters: `_clientId=${clientId}&_beneficiaryId=${beneficiaryId}`
    })
    formik.setFieldValue('beneficiary[0].firstName', res.record.beneficiaryName)
  }

  return (
    <FormShell resourceId={ResourceIds.InstantCash} form={formik} height={480} maxAccess={maxAccess}>
      <Grid container>
        {/* First Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2, pt: 2 }}>
          <Grid hideonempty xs={12}>
            <CustomTextField
              name='partnerReference'
              label={_labels.reference}
              value={formik.values.partnerReference}
              maxAccess={maxAccess}
              maxLength='30'
              error={formik.touched.partnerReference && Boolean(formik.errors.partnerReference)}
              helperText={formik.touched.partnerReference && formik.errors.partnerReference}
            />
          </Grid>
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
              }}
              maxAccess={maxAccess}
              error={formik.touched.deliveryModeId && Boolean(formik.errors.deliveryModeId)}
              helperText={formik.touched.deliveryModeId && formik.errors.deliveryModeId}
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
              name='fromCountryId'
              label={_labels.fromCountry}
              valueField='recordId'
              displayField='fromCountryName'
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('fromCountryId', newValue?.recordId)
                  formik.setFieldValue('fromCountryName', newValue?.destinationCountryName)
                } else {
                  formik.setFieldValue('fromCountryId', '')
                }
              }}
              maxAccess={maxAccess}
              error={formik.touched.fromCountryId && Boolean(formik.errors.fromCountryId)}
              helperText={formik.touched.fromCountryId && formik.errors.fromCountryId}
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
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('toCountryId', newValue?.recordId)
                } else {
                  formik.setFieldValue('toCountryId', '')
                }
              }}
              maxAccess={maxAccess}
              error={formik.touched.toCountryId && Boolean(formik.errors.toCountryId)}
              helperText={formik.touched.toCountryId && formik.errors.toCountryId}
            />
          </Grid>
        </Grid>
        {/* Second Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2, pt: 2 }}>
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
              valueField='deliveryModeDescription'
              displayField='deliveryModeDescription'
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('payingAgent', newValue?.deliveryModeDescription)
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
              numberField={true}
              label={_labels.sourceAmount}
              value={formik.values.sourceAmount}
              maxAccess={maxAccess}
              onClear={() => formik.setFieldValue('sourceAmount', '')}
              error={formik.touched.sourceAmount && Boolean(formik.errors.sourceAmount)}
              helperText={formik.touched.sourceAmount && formik.errors.sourceAmount}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid container>
        <Grid container sx={{ pt: 2 }}>
          <FieldSet title='Remitter'>
            {/* First Column */}
            <Grid container rowGap={2} xs={6} sx={{ px: 2, pt: 2 }}>
              <Grid item xs={12}>
                <CustomTextField
                  name='cardNo'
                  readOnly
                  label={_labels.cardNo}
                  value={formik.values.remitter[0].cardNo}
                  maxAccess={maxAccess}
                  error={formik.touched.cardNo && Boolean(formik.errors.cardNo)}
                  helperText={formik.touched.cardNo && formik.errors.cardNo}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='firstName'
                  label={_labels.name}
                  value={formik.values?.remitter[0].firstName}
                  readOnly
                  maxLength='20'
                  onClear={() => formik.setFieldValue('firstName', '')}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='mobileNumber'
                  phone={true}
                  label={_labels.mobileNumber}
                  value={formik.values?.remitter[0].mobileNumber}
                  readOnly
                  maxLength='15'
                  autoComplete='off'
                  onBlur={e => {
                    formik.handleBlur(e)
                  }}
                  onClear={() => formik.setFieldValue('mobileNumber', '')}
                  error={formik.touched.mobileNumber && Boolean(formik.errors.mobileNumber)}
                  helperText={formik.touched.mobileNumber && formik.errors.mobileNumber}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={RemittanceBankInterface.Combos.qry}
                  parameters={`_combo=2`}
                  name='relation'
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
            </Grid>
            {/* Second Column */}
            <Grid container rowGap={2} xs={6} sx={{ px: 2, pt: 2 }}>
              <Grid item xs={12}>
                <CustomTextField
                  name='otherRelation'
                  label={_labels.otherRelation}
                  value={formik.values.remitter[0].otherRelation}
                  error={formik.touched.otherRelation && Boolean(formik.errors.otherRelation)}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='employerName'
                  label={_labels.employerName}
                  value={formik.values.remitter[0].employerName}
                  error={formik.touched.employerName && Boolean(formik.errors.employerName)}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={RemittanceBankInterface.Combos.qry}
                  parameters={`_combo=4`}
                  name='employerStatus'
                  label={_labels.employerStatus}
                  valueField='recordId'
                  displayField='name'
                  values={formik.values.remitter[0].employerStatus}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      formik.setFieldValue('remitter[0].employerStatus', newValue?.recordId)
                    } else {
                      formik.setFieldValue('remitter[0].employerStatus', '')
                    }
                  }}
                  maxAccess={maxAccess}
                  error={formik.touched.employerStatus && Boolean(formik.errors.employerStatus)}
                  helperText={formik.touched.employerStatus && formik.errors.employerStatus}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='postalCode'
                  label={_labels.postalCode}
                  value={formik.values.remitter[0].address.postalCode}
                  error={formik.touched.postalCode && Boolean(formik.errors.postalCode)}
                  maxAccess={maxAccess}
                />
              </Grid>
            </Grid>
          </FieldSet>
        </Grid>
        {/* First Column */}
        <Grid container rowGap={3} xs={4} spacing={2} sx={{ pt: 2, pl: 5 }}>
          <FieldSet sx={{ pt: 2 }} title='Primary ID'>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RemittanceBankInterface.Combos.qry}
                parameters={`_combo=3`}
                name='type'
                readOnly
                label={_labels.idType}
                valueField='recordId'
                displayField='idtName'
                values={formik.values.remitter[0].primaryId[0].type}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('remitter[0].primaryId[0].type', newValue?.recordId)
                    formik.setFieldValue('remitter[0].primaryId[0].idtName', newValue?.name)
                  } else {
                    formik.setFieldValue('remitter[0].primaryId[0].type', '')
                    formik.setFieldValue('remitter[0].primaryId[0].idtName', '')
                  }
                }}
                maxAccess={maxAccess}
                error={formik.touched.type && Boolean(formik.errors.type)}
                helperText={formik.touched.type && formik.errors.type}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='number'
                label={_labels.number}
                value={formik.values.remitter[0].primaryId[0].number}
                maxAccess={maxAccess}
                error={formik.touched.number && Boolean(formik.errors.number)}
                helperText={formik.touched.number && formik.errors.number}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='issueDate'
                readOnly
                label={_labels.issueDate}
                value={formik.values.remitter[0].primaryId[0].issueDate}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='expiryDate'
                readOnly
                label={_labels.expiryDate}
                value={formik.values.remitter[0].primaryId[0].expiryDate}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Country.qry}
                name='placeOfIssue'
                readOnly
                label={_labels.placeOfIssue}
                valueField='placeOfIssue'
                displayFieldWidth={2}
                displayField='name'
                values={formik.values.remitter[0].primaryId[0].placeOfIssueName}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('remitter[0].primaryId[0].placeOfIssue', newValue?.recordId)
                    formik.setFieldValue('remitter[0].primaryId[0].placeOfIssueName', newValue?.name)
                  } else {
                    formik.setFieldValue('remitter[0].primaryId[0].placeOfIssue', '')
                    formik.setFieldValue('remitter[0].primaryId[0].placeOfIssueName', '')
                  }
                }}
                maxAccess={maxAccess}
              />
            </Grid>
          </FieldSet>
        </Grid>
        {/* Second Column */}
        <Grid container rowGap={3} xs={4} spacing={2} sx={{ pt: 2, height: '50%' }}>
          <FieldSet title='Beneficiary'>
            <Grid item xs={12}>
              <CustomTextField
                name='cardNo'
                label={_labels.cardNo}
                value={formik.values.beneficiary[0].cardNo}
                maxAccess={maxAccess}
                error={formik.touched.cardNo && Boolean(formik.errors.cardNo)}
                helperText={formik.touched.cardNo && formik.errors.cardNo}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='firstName'
                label={_labels.name}
                value={formik.values?.beneficiary[0].firstName}
                readOnly
                maxLength='20'
                onClear={() => formik.setFieldValue('firstName', '')}
                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='postalCode'
                label={_labels.postalCode}
                value={formik.values.beneficiary[0].address.postalCode}
                error={formik.touched.postalCode && Boolean(formik.errors.postalCode)}
                maxAccess={maxAccess}
              />
            </Grid>
          </FieldSet>
        </Grid>
        {/*Third Column*/}
        <Grid container rowGap={3} xs={4} spacing={2} sx={{ pt: 2 }}>
          <FieldSet title='Bank Details'>
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
                name='bankName'
                label={_labels.bank}
                form={formik}
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
                name='bankCode'
                label={_labels.bankCode}
                value={formik.values.beneficiary[0].bankDetails[0].bankCode}
                error={formik.touched.bankCode && Boolean(formik.errors.bankCode)}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='bankAccountNumber'
                label={_labels.bankAccNo}
                value={formik.values.beneficiary[0].bankDetails[0].bankAccountNumber}
                error={formik.touched.bankAccountNumber && Boolean(formik.errors.bankAccountNumber)}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextArea
                name='bankAddress1'
                label={_labels.bankAddress}
                value={formik.values.beneficiary[0].bankDetails[0].bankAddress1}
                rows={3}
                maxLength='100'
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
          </FieldSet>
        </Grid>
      </Grid>
    </FormShell>
  )
}
