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
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'

export default function InstantCash({
  onSubmit,
  cashData = {},
  window,
  clientData,
  deliveryModeId,
  payingAgent,
  payingCurrency,
  outwardsData,
  sysDefault
}) {
  const { getRequest } = useContext(RequestsContext)

  const { stack: stackError } = useError()

  const { labels: _labels, maxAccess } = useResourceQuery({
    datasetId: ResourceIds.InstantCash
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      deliveryModeId: deliveryModeId,
      payingAgent: payingAgent,
      sourceCurrency: sysDefault.currencyRef,
      targetCurrency: payingCurrency,
      sourceAmount: outwardsData?.amount || 0,
      toCountryId: '',
      totalTransactionAmountPerAnnum: clientData.hiddenTrxAmount,
      transactionsPerAnnum: clientData.hiddenTrxCount,
      remitter: {
        relation: clientData.relation,
        otherRelation: clientData.otherRelation,
        employerName: clientData.employerName,
        employerStatus: clientData?.employerStatus
      },
      beneficiary: {
        address: {
          postCode: clientData.postCode
        },
        bankDetails: {
          bankCode: clientData.bankDetails?.bankCode,
          bankName: clientData.bankDetails?.bankName,
          bankAddress1: clientData.bankDetails?.bankAddress1
        }
      }
    },
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      deliveryModeId: yup.string().required(),
      toCountryId: yup.string().required(),
      payingAgent: yup.string().required(),
      sourceAmount: yup.string().required(),
      remitter: yup.object().shape({
        employerName: yup.string().required(),
        employerStatus: yup.string().required()
      }),
      beneficiary: yup.object().shape({
        bankDetails: yup.object().shape({
          bankName: yup.string().required()
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
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item container xs={12} sx={{ px: 2, pt: 2 }}>
              <Grid hideonempty xs={6}>
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
              {/* <Grid hideonempty xs={12}>
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
                    formik.touched.totalTransactionAmountPerAnnum &&
                    Boolean(formik.errors.totalTransactionAmountPerAnnum)
                  }
                />
              </Grid> */}
            </Grid>
            <Grid item xs={6}>
              <FieldSet title='Remitter'>
                <Grid item xs={12}>
                  <CustomTextField
                    name='otherRelation'
                    onChange={event => formik.setFieldValue('remitter.otherRelation', event.target.value)}
                    label={_labels.otherRelation}
                    value={formik.values.remitter.otherRelation}
                    error={formik.touched.remitter?.otherRelation && Boolean(formik.errors.remitter?.otherRelation)}
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
                    endpointId={RemittanceBankInterface.Combos.qryCBX}
                    parameters={`_combo=4`}
                    name='remitter.employerStatus'
                    label={_labels.employerStatus}
                    required
                    valueField='name'
                    displayField='name'
                    value={formik.values.remitter.employerStatus}
                    onChange={(event, newValue) => {
                      console.log(newValue?.name)
                      formik.setFieldValue('remitter.employerStatus', newValue ? newValue?.name : '')
                    }}
                    maxAccess={maxAccess}
                    error={formik.touched.remitter?.employerStatus && Boolean(formik.errors.remitter?.employerStatus)}
                  />
                </Grid>
              </FieldSet>
            </Grid>
            <Grid item xs={6} sx={{ height: '50%' }}>
              <FieldSet title='Beneficiary'>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={RemittanceBankInterface.Bank.snapshot}
                    parameters={{
                      _receivingCountry: formik.values.toCountryId,
                      _payingAgent: formik.values.payingAgent,
                      _deliveryMode: formik.values.deliveryModeId,
                      _payoutCurrency: formik.values.targetCurrency
                    }}
                    required
                    valueField='name'
                    displayField='bankName'
                    name='beneficiary.bankDetails.bankName'
                    label={_labels.bank}
                    form={formik}
                    firstValue={formik.values.beneficiary.bankDetails.bankName}
                    readOnly={!(formik.values.deliveryModeId && formik.values.payingAgent)}
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
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
