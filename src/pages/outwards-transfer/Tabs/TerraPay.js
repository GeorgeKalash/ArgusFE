import { ResourceIds } from 'src/resources/ResourceIds'
import { useError } from 'src/error'
import { useContext, useEffect } from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { RemittanceBankInterface } from 'src/repositories/RemittanceBankInterface'
import { useForm } from 'src/hooks/form'
import * as yup from 'yup'
import { RemittanceOutwardsRepository } from 'src/repositories/RemittanceOutwardsRepository'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

export default function TerraPay({ onTerraPaySubmit, terraPay = {}, window, outwardsData, clientData }) {
  console.log('in terra')
  console.log(terraPay)

  const { getRequest } = useContext(RequestsContext)
  const { stack: stackError } = useError()

  const { labels: _labels, maxAccess } = useResourceQuery({
    datasetId: ResourceIds.Terrapay
  })

  const { formik } = useForm({
    maxAccess,
    initialValues: terraPay,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      //requestAmount: yup.string().required(' ')
      //creditorReceivingCountry: yup.string().required(' '),
      //requestCurrency: yup.string().required(' ')
      //creditorBankSubCode: yup.string().required(' ')
      //SHOULD BE MANDATORY FOR CAS OF ERROR MESSAGE
    }),
    onSubmit: values => {
      console.log('submit')
      const copy = { ...values }
      copy.quotation.creditorReceivingCountry = ''
      copy.quotation.requestCurrency = ''
      console.log(copy)
      onTerraPaySubmit(copy)
      window.close()
    }
  })

  useEffect(() => {
    ;(async function () {
      /*if (terraPay.quotation) {
        formik.setValues(terraPay)
        console.log('fill')
        console.log(terraPay)
      }*/
      terraPay.quotation.debitorMSIDSN = clientData.cellPhone
      terraPay.transaction.debitorMSIDSN = clientData.cellPhone

      //terraPay.quotation.requestAmount = outwardsData.amount
      terraPay.transaction.amount = outwardsData.amount

      if (outwardsData.amount) {
        formik.setFieldValue('requestAmount', outwardsData.amount)
      }

      if (outwardsData.countryId) {
        const res = await getRequest({
          extension: SystemRepository.Country.get,
          parameters: `_recordId=${outwardsData.countryId}`
        })
        console.log('result1', res.record)
        console.log(res?.record?.isoCode1?.trim())
        if (!res.record?.isoCode1) {
          stackError({
            message: `Please assign iso code1 to ${res.record.name}`
          })

          //window.close or feilds red

          return
        }

        formik.setFieldValue('quotation.creditorReceivingCountry', res?.record?.isoCode1)
        formik.setFieldValue('transaction.internationalTransferInformation.receivingCountry', res?.record?.isoCode1)
      }

      if (outwardsData.currencyId) {
        const res = await getRequest({
          extension: SystemRepository.Currency.get,
          parameters: `_recordId=${outwardsData.currencyId}`
        })
        console.log('result', res.record)
        console.log(res?.record?.isoCode?.trim())
        if (!res.record?.isoCode) {
          stackError({
            message: `Please assign iso code1 to ${res.record.name}`
          })

          //window.close or feilds red
          return
        }

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
        {
          // bank map
          <Grid hideonempty xs={12}>
            <ResourceComboBox
              endpointId={formik.values.creditorReceivingCountry && RemittanceBankInterface.Combos.qryTerrapyBanks}
              parameters={
                formik.values.creditorReceivingCountry && `_country=${formik.values.creditorReceivingCountry}`
              }
              name='creditorBankSubCode'
              label={_labels.creditorSubcode}
              valueField='recordId'
              displayField='name'
              values={formik.values}
              required
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('creditorBankSubCode', newValue?.recordId)
                } else {
                  formik.setFieldValue('creditorBankSubCode', '')
                }
              }}
              maxAccess={maxAccess}
              error={formik.touched.creditorBankSubCode && Boolean(formik.errors.creditorBankSubCode)}
            />
          </Grid>
        }
      </Grid>
    </FormShell>
  )
}
