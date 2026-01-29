import { Grid } from '@mui/material'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { RemittanceBankInterface } from '@argus/repositories/src/repositories/RemittanceBankInterface'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import FieldSet from '@argus/shared-ui/src/components/Shared/FieldSet'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import { useContext, useEffect } from 'react'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import * as yup from 'yup'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { useError } from '@argus/shared-providers/src/providers/error'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function InstantCash({
  onSubmit,
  cashData = {},
  window,
  clientData,
  productData: { deliveryModeId, payingAgent, payingCurrency },
  outwardsData,
  sysDefault
}) {
  const { getRequest } = useContext(RequestsContext)

  const { stack: stackError } = useError()

  const editMode = !!outwardsData?.recordId

  const { labels: _labels, maxAccess } = useResourceQuery({
    datasetId: ResourceIds.InstantCash
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: {
      deliveryModeId,
      payingAgent,
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
    validateOnChange: true,
    validationSchema: yup.object({
      deliveryModeId: yup.number().required(),
      payingAgent: yup.string().required(),
      sourceAmount: yup.number().required(),
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
      if (cashData.deliveryModeId) formik.setValues(cashData)
      if (outwardsData.countryId) {
        const res = await getRequest({
          extension: SystemRepository.Country.get,
          parameters: `_recordId=${outwardsData.countryId}`
        })
        if (!res.record?.isoCode1) {
          stackError({
            message: `${_labels.assignIsoCode1} ${res.record.name}`
          })

          return
        }
        formik.setFieldValue('toCountryId', res?.record?.isoCode1.trim())
      }
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} disabledSubmit={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item container xs={12}>
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
            </Grid>
            <Grid item xs={6}>
              <FieldSet title={_labels.remitter}>
                <Grid item xs={12}>
                  <CustomTextField
                    name='otherRelation'
                    onChange={event => formik.setFieldValue('remitter.otherRelation', event.target.value)}
                    label={_labels.otherRelation}
                    value={formik.values.remitter.otherRelation}
                    readOnly={editMode}
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
                    readOnly={editMode}
                    valueField='name'
                    displayField='name'
                    values={formik.values.remitter.employerStatus}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('remitter.employerStatus', newValue ? newValue?.name : '')
                    }}
                    maxAccess={maxAccess}
                    error={formik.touched.remitter?.employerStatus && Boolean(formik.errors.remitter?.employerStatus)}
                  />
                </Grid>
              </FieldSet>
            </Grid>
            <Grid item xs={6}>
              <FieldSet title={_labels.beneficiary}>
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
                    readOnly={!(formik.values.deliveryModeId && formik.values.payingAgent) || editMode}
                    maxAccess={maxAccess}
                    secondDisplayField={false}
                    onChange={async (event, newValue) => {
                      formik.setFieldValue('beneficiary.bankDetails.bankCode', newValue?.recordId)
                      formik.setFieldValue('beneficiary.bankDetails.bankAddress1', newValue?.address1)
                      formik.setFieldValue('beneficiary.bankDetails.bankName', newValue?.name || '')
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
                    name='beneficiary.address.postCode'
                    readOnly={editMode}
                    onChange={event => formik.setFieldValue('beneficiary.address.postCode', event.target.value)}
                    onClear={() => formik.setFieldValue('beneficiary.address.postCode', '')}
                    label={_labels.postalCode}
                    value={formik.values.beneficiary.address.postCode}
                    error={
                      formik.touched.beneficiary?.address?.postCode &&
                      Boolean(formik.errors.beneficiary?.address?.postCode)
                    }
                    maxAccess={maxAccess}
                  />
                </Grid>
              </FieldSet>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
