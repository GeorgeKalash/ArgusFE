import { Grid } from '@mui/material'
import { useForm } from 'react-hook-form'
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
              issueDate: '',
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
          <FormGrid item hideonempty xs={12}>
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
                `_receivingCountry=${formik.values.deliveryModeId}&_toCountryId=${formik.values.toCountryId}`
              }
              name='fromCountryId'
              label={_labels.fromCountry}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('fromCountryId', newValue?.recordId)
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
              parameters={formik.values.deliveryModeId && `_receivingCountry=${formik.values.deliveryModeId}`}
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
                `_receivingCountry=${formik.values.deliveryModeId}&_toCountryId=${formik.values.toCountryId}`
              }
              name='payingAgent'
              label={_labels.payingAgent}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('payingAgent', newValue?.recordId)
                } else {
                  formik.setFieldValue('payingAgent', '')
                }
              }}
              maxAccess={maxAccess}
              error={formik.touched.payingAgent && Boolean(formik.errors.payingAgent)}
              helperText={formik.touched.payingAgent && formik.errors.payingAgent}
            />
          </FormGrid>
          <FormGrid hideonempty xs={12}>
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
          </FormGrid>
        </Grid>
        {/* Second Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2, pt: 2 }}>
          <FormGrid hideonempty xs={12}>
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
          <FormGrid hideonempty xs={12}>
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
          </FormGrid>
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
    </FormShell>
  )
}
