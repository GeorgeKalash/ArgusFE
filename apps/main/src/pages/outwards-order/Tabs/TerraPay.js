import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { useError } from '@argus/shared-providers/src/providers/error'
import { useContext, useEffect } from 'react'
import { Grid } from '@mui/material'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import * as yup from 'yup'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { RemittanceBankInterface } from '@argus/repositories/src/repositories/RemittanceBankInterface'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import Form from '@argus/shared-ui/src/components/Shared/Form'

export default function TerraPay({ onSubmit, terraPay = {}, window, data }) {
  const { getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()

  const { labels, maxAccess } = useResourceQuery({
    datasetId: ResourceIds.Terrapay
  })

  const editMode = data?.recordId

  const { formik } = useForm({
    maxAccess,
    initialValues: terraPay,
    validateOnChange: true,
    validationSchema: yup.object({
      transaction: yup.object({
        creditorBankSubCode: yup.string().required(),
        internationalTransferInformation: yup.object({
          relationshipSender: yup.string().required()
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
      formik.setFieldValue('quotation.requestAmount', data?.amount)

      if (data.countryId) {
        const res = await getRequest({
          extension: SystemRepository.Country.get,
          parameters: `_recordId=${data.countryId}`
        })

        !res.record.isoCode1 &&
          stackError({
            message: `${labels.assignIsoCode1} ${res.record.name}`
          })

        formik.setFieldValue('quotation.creditorReceivingCountry', res?.record?.isoCode1.trim())
      }

      if (data.currencyId) {
        const res = await getRequest({
          extension: SystemRepository.Currency.get,
          parameters: `_recordId=${data.currencyId}`
        })

        !res.record.isoCode &&
          stackError({
            message: `${labels.assignIsoCode1} ${res.record.name}`
          })

        formik.setFieldValue('quotation.requestCurrency', res?.record?.isoCode)
      }
    })()
  }, [])

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess} disabledSubmit={editMode}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomTextField
                name='quotation.creditorReceivingCountry'
                readOnly
                onChange={formik.handleChange}
                maxAccess={maxAccess}
                label={labels.country}
                value={formik.values.quotation?.creditorReceivingCountry}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomNumberField
                name='quotation.requestAmount'
                readOnly
                onChange={formik.handleChange}
                maxAccess={maxAccess}
                label={labels.amount}
                value={formik.values.quotation?.requestAmount}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                name='quotation.requestCurrency'
                readOnly
                onChange={formik.handleChange}
                maxAccess={maxAccess}
                label={labels.currency}
                value={formik.values.quotation?.requestCurrency}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RemittanceBankInterface.Combos.qryTerrapayCBX}
                parameters={`_combo=1`}
                name='transaction.internationalTransferInformation.relationshipSender'
                label={labels.relSender}
                valueField='recordId'
                displayField='name'
                values={formik.values.transaction.internationalTransferInformation.relationshipSender}
                required
                readOnly={editMode}
                onChange={(event, newValue) => {
                  formik.setFieldValue(
                    'transaction.internationalTransferInformation.relationshipSender',
                    newValue?.recordId || ''
                  )
                }}
                maxAccess={maxAccess}
                error={
                  formik.touched.transaction?.internationalTransferInformation?.relationshipSender &&
                  Boolean(formik.errors.transaction?.internationalTransferInformation?.relationshipSender)
                }
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RemittanceBankInterface.Combos.qryTerrapyBanks}
                parameters={`_country=${data?.countryRef || ''}`}
                name='transaction.creditorBankSubCode'
                label={labels.bank}
                valueField='bankCode'
                displayField='bankName'
                values={formik.values.transaction.creditorBankSubCode}
                required
                readOnly={editMode}
                onChange={async (event, newValue) => {
                  formik.setFieldValue('transaction.bankName', newValue?.bankName || '')
                  formik.setFieldValue('transaction.providerCode', newValue?.providerCode || '')
                  formik.setFieldValue('transaction.creditorOrganisationid', newValue?.bankName || '')
                  formik.setFieldValue('transaction.creditorBankSubCode', newValue?.bankCode || '')

                  const result = await getRequest({
                    extension: RemittanceBankInterface.Combos.terrapayAccountStatus,
                    parameters: `_accountId=${formik.values.quotation?.creditorBankAccount}&_country=${
                      data?.countryRef
                    }&_bankName=${newValue?.bankName || ''}&_MSISDN=${
                      formik.values.quotation?.creditorMSIDSN
                    }&_beneficiaryName=${data?.beneficiaryName}&_provider=${newValue?.providerCode || ''}&_bankCode=${
                      data?.branchCode
                    }&_bankSubCode=null&_accountType=${'checking'}`
                  })

                  if (result?.record?.status) {
                  }
                }}
                maxAccess={maxAccess}
                error={
                  formik.touched.transaction?.creditorBankSubCode &&
                  Boolean(formik.errors.transaction?.creditorBankSubCode)
                }
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}
