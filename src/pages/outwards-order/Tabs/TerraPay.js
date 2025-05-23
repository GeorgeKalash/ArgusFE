import { ResourceIds } from 'src/resources/ResourceIds'
import { useError } from 'src/error'
import { useContext, useEffect } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import { RemittanceBankInterface } from 'src/repositories/RemittanceBankInterface'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'

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
            message: `Please assign iso code1 to ${res.record.name}`
          })

        formik.setFieldValue('quotation.requestCurrency', res?.record?.isoCode)
      }
    })()
  }, [])

  return (
    <FormShell
      isInfo={false}
      isCleared={false}
      resourceId={ResourceIds.Terrapay}
      form={formik}
      maxAccess={maxAccess}
      disabledSubmit={editMode}
    >
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
                  formik.setValues(prevValues => ({
                    ...prevValues,
                    transaction: {
                      ...prevValues.transaction,
                      bankName: newValue?.bankName || '',
                      creditorBankSubCode: newValue?.bankCode || '',
                      providerCode: newValue?.providerCode || '',
                      creditorOrganisationid: newValue?.bankName || ''
                    }
                  }))

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
    </FormShell>
  )
}
