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
  console.log('in terra')
  console.log(terraPay, outwardsData)

  const { getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()

  const { labels: _labels, maxAccess } = useResourceQuery({
    datasetId: ResourceIds.Terrapay
  })
  console.log(_labels)

  const { formik } = useForm({
    maxAccess,
    initialValues: terraPay,
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      //requestAmount: yup.string().required(' ')
      //creditorReceivingCountry: yup.string().required(' ')
      //requestCurrency: yup.string().required(' ')
      //SHOULD BE MANDATORY FOR CASE OF ERROR MESSAGE BUT HERE IT IS ONLY DISPLAY UNTIL NOW !! CHECK AGAIN WHEN ADDING FIELD
    }),
    onSubmit: values => {
      const copy = { ...values }
      console.log('copyTerra', copy)
      copy.quotation.creditorReceivingCountry = ''
      copy.quotation.requestCurrency = ''
      onSubmit(copy)
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

        formik.setFieldValue('quotation.creditorReceivingCountry', res?.record?.isoCode1)
        formik.setFieldValue('transaction.internationalTransferInformation.receivingCountry', res?.record?.isoCode1)
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

        formik.setFieldValue('quotation.requestCurrency', res?.record?.isoCode.trim())
      }

      console.log('formik check ', formik)
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
            label={_labels.country}
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
            label={_labels.amount}
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
            label={_labels.currency}
            value={formik.values.quotation?.requestCurrency}
            error={formik.touched.quotation?.requestCurrency && Boolean(formik.errors.quotation?.requestCurrency)}
          />
        </Grid>

        <Grid hideonempty xs={12}>
          <ResourceComboBox
            endpointId={RemittanceBankInterface.Combos.qryTerrapayCBX}
            parameters={`_combo=1`}
            name='deliveryModeId'
            label={'_labels.deliveryMode'}
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
          <ResourceComboBox
            endpointId={RemittanceBankInterface.Combos.qryTerrapyBanks}
            parameters={`_country=${outwardsData?.countryRef || ''}`}
            name='transaction.bankName'
            label={'_labels.bank'}
            valueField='bankCode'
            displayField='bankName'
            values={formik.values.transaction.creditorBankSubCode}
            required
            onChange={(event, newValue) => {
              // formik.setFieldValue('transaction..bankCode', newValue ? newValue.bankCode : '')
              formik.setFieldValue('transaction.bankName', newValue ? newValue.bankName : '')
              formik.setFieldValue('transaction.creditorBankSubCode', newValue ? newValue.bankCode : '')
              formik.setFieldValue('transaction.providerCode', newValue ? newValue.providerCode : '')
            }}
            maxAccess={maxAccess}
            error={formik.touched.deliveryModeId && Boolean(formik.errors.deliveryModeId)}
          />
        </Grid>
        {/* <Grid hideonempty xs={12}>
          <ResourceComboBox
            endpointId={RemittanceBankInterface.Combos.qryTerrapyBanks}
            parameters={`_country=${outwardsData?.countryRef}`}
            name='bankName'
            label={_labels.deliveryMode}
            valueField='bankCode'
            displayField='bankName'
            values={formik.values}
            required
            onChange={(event, newValue) => {
              formik.setFieldValue('bankCode', newValue ? newValue.bankCode : '')
              formik.setFieldValue('bankName', newValue ? newValue.bankName : '')
            }}
            maxAccess={maxAccess}
            error={formik.touched.deliveryModeId && Boolean(formik.errors.deliveryModeId)}
          />
        </Grid> */}
        <Grid hideonempty xs={12}>
          <ResourceComboBox
            endpointId={RemittanceBankInterface.Combos.terrapayAccountStatus}
            parameters={`_accountId=${beneficiary?.beneficiaryIBAN}&_country=${outwardsData?.countryRef}&_bankName=${
              formik.values.transaction.bankName
            }&_MSISDN=${beneficiary.beneficiaryCellPhone}&_beneficiaryName=${beneficiary?.beneficiaryName}&_provider=${
              formik.values?.transaction?.providerCode
            }&_bankCode=${formik.values?.transaction?.creditorBankSubCode}&_bankSubCode=${
              formik.values?.transaction?.creditorBankSubCode
            }&_accountType=${'checking'}`}
            name='bankName'
            label={'_labels.AccountStatus'}
            valueField='recordId'
            displayField='name'
            values={formik.values}
            required
            onChange={(event, newValue) => {
              formik.setFieldValue('bankCode', newValue ? newValue.recordId : '')
              formik.setFieldValue('bankName', newValue ? newValue.name : '')
            }}
            maxAccess={maxAccess}
            error={formik.touched.deliveryModeId && Boolean(formik.errors.deliveryModeId)}
          />
        </Grid>
      </Grid>
    </FormShell>
  )
}
