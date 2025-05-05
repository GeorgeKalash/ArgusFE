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

export default function TerraPay({ onSubmit, terraPay = {}, window, outwardsData, beneficiary }) {
  const { getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()

  const { labels, maxAccess } = useResourceQuery({
    datasetId: ResourceIds.Terrapay
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: terraPay,
    enableReinitialize: true,
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
      formik.setFieldValue('quotation.requestAmount', outwardsData?.amount)

      if (outwardsData.countryId) {
        const res = await getRequest({
          extension: SystemRepository.Country.get,
          parameters: `_recordId=${outwardsData.countryId}`
        })

        !res.record.isoCode1 &&
          stackError({
            message: `Please assign iso code1 to ${res.record.name}`
          })

        formik.setFieldValue('quotation.creditorReceivingCountry', res?.record?.isoCode1.trim())
      }

      if (outwardsData.currencyId) {
        const res = await getRequest({
          extension: SystemRepository.Currency.get,
          parameters: `_recordId=${outwardsData.currencyId}`
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
      height={480}
      maxAccess={maxAccess}
    >
      <Grid container rowGap={2} sx={{ px: 2, pt: 2 }}>
        <Grid hideonempty xs={12}>
          <CustomTextField
            name='creditorReceivingCountry'
            required
            readOnly
            onChange={formik.handleChange}
            label={labels.country}
            value={formik.values.quotation?.creditorReceivingCountry}
            error={
              formik.touched.quotation?.creditorReceivingCountry &&
              Boolean(formik.errors.quotation?.creditorReceivingCountry)
            }
          />
        </Grid>
        <Grid hideonempty xs={12}>
          <CustomNumberField
            name='requestAmount'
            required
            readOnly
            onChange={formik.handleChange}
            label={labels.amount}
            value={formik.values.quotation?.requestAmount}
            error={formik.touched.quotation?.requestAmount && Boolean(formik.errors.quotation?.requestAmount)}
          />
        </Grid>
        <Grid hideonempty xs={12}>
          <CustomTextField
            name='requestCurrency'
            required
            readOnly
            onChange={formik.handleChange}
            label={labels.currency}
            value={formik.values.quotation?.requestCurrency}
            error={formik.touched.quotation?.requestCurrency && Boolean(formik.errors.quotation?.requestCurrency)}
          />
        </Grid>
        <Grid hideonempty xs={12}>
          <ResourceComboBox
            endpointId={RemittanceBankInterface.Combos.qryTerrapayCBX}
            parameters={`_combo=1`}
            name='relationshipSender'
            label={labels.relSender}
            valueField='recordId'
            displayField='name'
            values={formik.values.transaction.internationalTransferInformation.relationshipSender}
            required
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
        <Grid hideonempty xs={12}>
          <ResourceComboBox
            endpointId={RemittanceBankInterface.Combos.qryTerrapyBanks}
            parameters={`_country=${outwardsData?.countryRef || ''}`}
            name='transaction.creditorBankSubCode'
            label={labels.bank}
            valueField='bankCode'
            displayField='bankName'
            values={formik.values.transaction.creditorBankSubCode}
            required
            onChange={async (event, newValue) => {
              formik.setFieldValue('transaction.bankName', newValue?.bankName || '')
              formik.setFieldValue('transaction.creditorBankSubCode', newValue?.bankCode || '')
              formik.setFieldValue('transaction.providerCode', newValue?.providerCode || '')
              formik.setFieldValue('transaction.creditorOrganisationid', newValue?.bankName || '')

              const result = await getRequest({
                extension: RemittanceBankInterface.Combos.terrapayAccountStatus,
                parameters: `_accountId=${formik.values.quotation?.creditorBankAccount}&_country=${
                  outwardsData?.countryRef
                }&_bankName=${newValue?.bankName || ''}&_MSISDN=${
                  formik.values.quotation?.creditorMSIDSN
                }&_beneficiaryName=${beneficiary?.beneficiaryName}&_provider=${
                  newValue?.providerCode || ''
                }&_bankCode=${beneficiary?.branchCode}&_bankSubCode=null&_accountType=${'checking'}`
              })

              if (result?.record?.status) {
              }
            }}
            maxAccess={maxAccess}
            error={
              formik.touched.transaction?.creditorBankSubCode && Boolean(formik.errors.transaction?.creditorBankSubCode)
            }
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
