import { FormControl, Grid, TextField } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import * as yup from 'yup'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import FormGrid from 'src/components/form/layout/FormGrid'
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

export default function InstantCash() {
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
              number: '',
              expiryDate: '',
              expiryDate: '',
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

  return (
    <FormShell resourceId={ResourceIds.InstantCash} form={formik} height={480} maxAccess={maxAccess}>
      <Grid container>
        {/* First Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2, pt: 2 }}>
          <FormGrid hideonempty xs={12}>
            <CustomTextField
              name='partnerReference'
              label={_labels.reference}
              value={formik.values.partnerReference}
              maxAccess={maxAccess}
              maxLength='30'
              error={formik.touched.partnerReference && Boolean(formik.errors.partnerReference)}
              helperText={formik.touched.partnerReference && formik.errors.partnerReference}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
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
          </FormGrid>
          <FormGrid hideonempty xs={12}>
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
          </FormGrid>
          <FormGrid hideonempty xs={12}>
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
          </FormGrid>
          <FormGrid hideonempty xs={12}>
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
          </FormGrid>
        </Grid>
        {/* Second Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2, pt: 2 }}>
          <FormGrid hideonempty xs={12}>
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
          </FormGrid>
          <FormGrid hideonempty xs={12}>
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
          </FormGrid>
          <FormGrid hideonempty xs={12}>
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
          </FormGrid>
        </Grid>
      </Grid>
      <Grid container rowGap={2} xs={12} spacing={2} sx={{ px: 2, pt: 5 }}>
        <FieldSet title='Remitter'>
          {/* First Column */}
          <Grid container rowGap={2} xs={6} sx={{ px: 2, pt: 2 }}>
            <Grid item xs={12}>
              <CustomTextField
                name='cardNo'
                label={_labels.cardNo}
                value={formik.values.remitter.cardNo}
                maxAccess={maxAccess}
                error={formik.touched.cardNo && Boolean(formik.errors.cardNo)}
                helperText={formik.touched.cardNo && formik.errors.cardNo}
              />
            </Grid>
            <Grid container xs={12} spacing={2} sx={{ pl: '10px', pt: 2 }}>
              <Grid item xs={4}>
                <CustomTextField
                  name='firstName'
                  label={_labels.firstName}
                  value={formik.values?.remitter.firstName}
                  readOnly
                  onChange={formik.handleChange}
                  maxLength='20'
                  onClear={() => formik.setFieldValue('firstName', '')}
                  error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={4}>
                <CustomTextField
                  name='middleName'
                  label={_labels.middleName}
                  value={formik.values?.remitter.middleName}
                  readOnly
                  onChange={formik.handleChange}
                  maxLength='20'
                  onClear={() => formik.setFieldValue('middleName', '')}
                  error={formik.touched.middleName && Boolean(formik.errors.middleName)}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={4}>
                <CustomTextField
                  name='lastName'
                  label={_labels.lastName}
                  value={formik.values?.remitter.lastName}
                  readOnly
                  onChange={formik.handleChange}
                  maxLength='20'
                  onClear={() => formik.setFieldValue('lastName', '')}
                  error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                  maxAccess={maxAccess}
                />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='mobileNumber'
                phone={true}
                label={_labels.mobileNumber}
                value={formik.values?.remitter.mobileNumber}
                readOnly
                onChange={formik.handleChange}
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
              <CustomTextField
                name='phoneNumber'
                phone={true}
                label={_labels.phoneNumber}
                value={formik.values?.remitter.phoneNumber}
                readOnly
                onChange={formik.handleChange}
                maxLength='15'
                autoComplete='off'
                onBlur={e => {
                  formik.handleBlur(e)
                }}
                onClear={() => formik.setFieldValue('phoneNumber', '')}
                error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
                helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <Grid item xs={12}>
                <CustomTextField
                  name='email'
                  label={_labels.email}
                  value={formik.values.remitter.email}
                  type='email'
                  required
                  placeholder='johndoe@email.com'
                  readOnly
                  error={formik.touched.email && Boolean(formik.errors.email)}
                />
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <CustomDatePicker
                name='dateOfBirth'
                label={_labels.expiryDate}
                value={formik.values.remitter.dateOfBirth}
                readOnly
                maxAccess={maxAccess}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                datasetId={DataSets.GENDER}
                name='gender'
                label={_labels.gender}
                valueField='key'
                displayField='value'
                values={formik.values}
                maxAccess={maxAccess}
                readOnly
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RemittanceBankInterface.Combos.qry}
                parameters={`_combo=2`}
                name='relation'
                label={_labels.relation}
                valueField='recordId'
                displayField='name'
                values={formik.values.remitter}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('relation', newValue?.recordId)
                  } else {
                    formik.setFieldValue('relation', '')
                  }
                }}
                maxAccess={maxAccess}
                error={formik.touched.relation && Boolean(formik.errors.relation)}
                helperText={formik.touched.relation && formik.errors.relation}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RemittanceBankInterface.Combos.qry}
                parameters={`_combo=4`}
                name='employerStatus'
                label={_labels.employeeStatus}
                valueField='recordId'
                displayField='name'
                values={formik.values.remitter}
                onChange={(event, newValue) => {
                  if (newValue) {
                    formik.setFieldValue('employerStatus', newValue?.recordId)
                  } else {
                    formik.setFieldValue('employerStatus', '')
                  }
                }}
                maxAccess={maxAccess}
                error={formik.touched.employerStatus && Boolean(formik.errors.employerStatus)}
                helperText={formik.touched.employerStatus && formik.errors.employerStatus}
              />
            </Grid>
          </Grid>
          {/* Second Column */}
          <Grid container rowGap={2} xs={6} sx={{ px: 2, pt: 2 }}>
            <FieldSet sx={{ pt: 2 }} title='Primary ID'>
              <FormGrid item xs={12}>
                <ResourceComboBox
                  endpointId={RemittanceBankInterface.Combos.qry}
                  parameters={`_combo=3`}
                  name='type'
                  label={_labels.types}
                  valueField='recordId'
                  displayField='name'
                  values={formik.values.remitter.primaryId}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      formik.setFieldValue('type', newValue?.recordId)
                    } else {
                      formik.setFieldValue('type', '')
                    }
                  }}
                  maxAccess={maxAccess}
                  error={formik.touched.type && Boolean(formik.errors.type)}
                  helperText={formik.touched.type && formik.errors.type}
                />
              </FormGrid>
              <Grid item xs={12}>
                <CustomTextField
                  name='number'
                  label={_labels.number}
                  value={formik.values.remitter[0].primaryId.number}
                  maxAccess={maxAccess}
                  error={formik.touched.number && Boolean(formik.errors.number)}
                  helperText={formik.touched.number && formik.errors.number}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomDatePicker
                  name='expiryDate'
                  label={_labels.expiryDate}
                  value={formik.values.remitter[0].primaryId.expiryDate}
                  error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomDatePicker
                  name='expiryDate'
                  label={_labels.expiryDate}
                  value={formik.values.remitter[0].primaryId.expiryDate}
                  error={formik.touched.expiryDate && Boolean(formik.errors.expiryDate)}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SystemRepository.Country.qry}
                  name='placeOfIssue'
                  label={_labels.placeOfIssue}
                  valueField='recordId'
                  displayFieldWidth={2}
                  displayField={['reference', 'name']}
                  values={formik.values.remitter[0].primaryId.placeOfIssue}
                  error={
                    formik.values.remitter[0].primaryId.placeOfIssue &&
                    Boolean(formik.values.remitter[0].primaryId.placeOfIssue)
                  }
                  onChange={(event, newValue) => {
                    if (newValue) {
                      formik.setFieldValue('placeOfIssue', newValue?.recordId)
                    } else {
                      formik.setFieldValue('placeOfIssue', '')
                    }
                  }}
                  maxAccess={maxAccess}
                />
              </Grid>
            </FieldSet>
            <FieldSet title='Address'>
              <Grid item xs={12}>
                <ResourceLookup
                  endpointId={SystemRepository.City.snapshot}
                  parameters={{
                    _countryId: formik.values.remitter[0].address.country,
                    _stateId: formik.values.remitter[0].address.state ? formik.values.remitter[0].address.state : 0
                  }}
                  valueField='name'
                  displayField='name'
                  name='city'
                  label={_labels.city}
                  readOnly
                  form={formik}
                  secondDisplayField={false}
                  errorCheck={'city'}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceLookup
                  endpointId={SystemRepository.CityDistrict.snapshot}
                  parameters={{
                    _cityId: formik.values.remitter[0].address.city
                  }}
                  valueField='name'
                  displayField='name'
                  name='district'
                  label={_labels.cityDistrict}
                  readOnly
                  form={formik}
                  secondDisplayField={false}
                  errorCheck={'cityDistrictId'}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={SystemRepository.Country.qry}
                  name='country'
                  label={_labels.country}
                  valueField='recordId'
                  displayFieldWidth={2}
                  values={formik.values.remitter[0].address.country}
                  error={
                    formik.values.remitter[0].address.country && Boolean(formik.values.remitter[0].address.country)
                  }
                  readOnly
                  maxAccess={maxAccess}
                  displayField={['reference', 'name']}
                />
              </Grid>
              <Grid item xs={12}>
                <ResourceComboBox
                  endpointId={formik.values.remitter[0].address.country && SystemRepository.State.qry}
                  parameters={
                    formik.values.remitter[0].address.country &&
                    `_countryId=${formik.values.remitter[0].address.country || 0}`
                  }
                  name='state'
                  label={_labels.state}
                  valueField='recordId'
                  displayField='name'
                  readOnly
                  values={formik.values.remitter[0].address.country}
                  error={formik.touched.stateId && Boolean(formik.errors.stateId)}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='postalCode'
                  label={_labels.postalCode}
                  value={formik.values.remitter[0].address.postalCode}
                  error={formik.touched.postalCode && Boolean(formik.errors.postalCode)}
                  maxAccess={maxAccess}
                  readOnly
                />
              </Grid>
            </FieldSet>
          </Grid>
        </FieldSet>
      </Grid>
    </FormShell>
  )
}
