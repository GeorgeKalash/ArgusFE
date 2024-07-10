import { Grid } from '@mui/material'
import FormShell from 'src/components/Shared/FormShell'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { RemittanceBankInterface } from 'src/repositories/RemittanceBankInterface'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import FieldSet from 'src/components/Shared/FieldSet'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { useContext, useEffect } from 'react'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useError } from 'src/error'

export default function InstantCash({ onSubmit, cashData = {}, window, clientData, outwardsData }) {
  const { getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()

  const { labels: _labels, maxAccess } = useResourceQuery({
    datasetId: ResourceIds.InstantCash
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      deliveryModeId: '',
      currency: '',
      sourceAmount: outwardsData?.amount || 0,
      toCountryId: '',
      totalTransactionAmountPerAnnum: clientData.hiddenTrxAmount,
      transactionsPerAnnum: clientData.hiddenTrxCount,
      remitter: {
        relation: '',
        otherRelation: '',
        employerName: clientData.hiddenSponserName,
        employerStatus: ''
      },
      beneficiary: {
        address: {
          postCode: ''
        },
        bankDetails: {
          bankCode: '',
          bankName: '',
          bankAddress1: ''
        }
      }
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      deliveryModeId: yup.string().required(' '),
      toCountryId: yup.string().required(' '),
      payingAgent: yup.string().required(' '),
      sourceAmount: yup.string().required(' '),
      remitter: yup.object().shape({
        employerName: yup.string().required(' ')
      }),
      beneficiary: yup.object().shape({
        bankDetails: yup.object().shape({
          bankName: yup.string().required(' ')
        })
      })
    }),
    onSubmit: values => {
      onSubmit(values)
      window.close()
    }
  })
  useEffect(() => {
    ;(async function () {
      try {
        if (cashData.deliveryModeId) formik.setValues(cashData)
        if (outwardsData.countryId) {
          const res = await getRequest({
            extension: SystemRepository.Country.get,
            parameters: `_recordId=${outwardsData.countryId}`
          })
          if (!res.record?.isoCode1) {
            stackError({
              message: `Please assign iso code1 to ${res.record.name}`
            })

            return
          }
          formik.setFieldValue('toCountryId', res?.record?.isoCode1.trim())
        }
      } catch (error) {}
    })()
  }, [])

  return (
    <FormShell
      isInfo={false}
      isCleared={false}
      resourceId={ResourceIds.InstantCash}
      form={formik}
      height={480}
      maxAccess={maxAccess}
    >
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
                formik.setFieldValue('deliveryModeId', newValue ? newValue.recordId : '')
                formik.setFieldValue('payingAgent', '')
              }}
              maxAccess={maxAccess}
              error={formik.touched.deliveryModeId && Boolean(formik.errors.deliveryModeId)}
            />
          </Grid>
          <Grid hideonempty xs={12}>
            <CustomTextField
              name='toCountryId'
              required
              readOnly
              onChange={formik.handleChange}
              label={_labels.toCountry}
              value={formik.values.toCountryId}
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
              required
              displayField='description'
              columnsInDropDown={[
                { key: 'description', value: 'Paying Agent' },
                { key: 'payingCurrency', value: 'Paying Currency' }
              ]}
              values={formik.values}
              onChange={(event, newValue) => {
                formik.setFieldValue('payingAgent', newValue ? newValue.recordId : '')
                formik.setFieldValue('currency', newValue ? newValue.payingCurrency : '')
              }}
              maxAccess={maxAccess}
              error={formik.touched.payingAgent && Boolean(formik.errors.payingAgent)}
            />
          </Grid>
        </Grid>
        {/* Second Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2, pt: 2, height: '50%' }}>
          <Grid hideonempty xs={12}>
            <CustomNumberField
              name='sourceAmount'
              onChange={formik.handleChange}
              label={_labels.sourceAmount}
              value={formik.values.sourceAmount}
              error={formik.touched.sourceAmount && Boolean(formik.errors.sourceAmount)}
              maxAccess={maxAccess}
              required
              readOnly
              onClear={() => formik.setFieldValue('sourceAmount', '')}
            />
          </Grid>
          <Grid hideonempty xs={12}>
            <CustomNumberField
              name='transactionsPerAnnum'
              onChange={formik.handleChange}
              label={_labels.trxCountPerYear}
              readOnly
              value={formik.values.transactionsPerAnnum}
              error={formik.touched.transactionsPerAnnum && Boolean(formik.errors.transactionsPerAnnum)}
            />
          </Grid>
          <Grid hideonempty xs={12}>
            <CustomNumberField
              name='totalTransactionAmountPerAnnum'
              onChange={formik.handleChange}
              readOnly
              label={_labels.trxAmountPerYear}
              value={formik.values.totalTransactionAmountPerAnnum}
              error={
                formik.touched.totalTransactionAmountPerAnnum && Boolean(formik.errors.totalTransactionAmountPerAnnum)
              }
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid container sx={{ pt: 2 }}>
        <Grid container rowGap={2} xs={6} spacing={2} sx={{ pt: 5 }}>
          <FieldSet title='Remitter'>
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
                required
                readOnly
                onChange={event => formik.setFieldValue('remitter.employerName', event.target.value)}
                label={_labels.employerName}
                onClear={() => formik.setFieldValue('remitter.employerName', '')}
                value={formik.values.remitter.employerName}
                error={formik.touched.remitter?.employerName && Boolean(formik.errors.remitter?.employerName)}
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
                  formik.setFieldValue('remitter.employerStatus', newValue ? newValue.recordId : '')
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
                required
                valueField='name'
                displayField='bankName'
                name='beneficiary.bankDetails.bankName'
                label={_labels.bank}
                form={formik}
                firstValue={formik.values.beneficiary.bankDetails.bankName}
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
                numberField={true}
                name='beneficiary.postCode'
                onChange={event => formik.setFieldValue('beneficiary.address.postCode', event.target.value)}
                label={_labels.postalCode}
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
