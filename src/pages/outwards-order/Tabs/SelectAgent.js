import { Grid } from '@mui/material'
import React from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { RemittanceBankInterface } from 'src/repositories/RemittanceBankInterface'
import * as yup from 'yup'

export default function SelectAgent({
  labels,
  maxAccess,
  originAmount,
  baseAmount,
  productId,
  payingCurrency,
  receivingCountry,
  agentCode,
  setData,
  targetCurrency,
  agentDeliveryMode,
  window
}) {
  const { formik } = useForm({
    initialValues: {
      agentCode: agentCode,
      agentName: '',
      productId: productId,
      fees: '',
      exRate: '',
      originAmount: originAmount,
      baseAmount: baseAmount,
      bankName: '',
      bankNameCode: '',
      deliveryModeId: agentDeliveryMode,
      payingCurrency: payingCurrency
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    validationSchema: yup.object({
      agentCode: yup.string().required()
    }),
    onSubmit: async obj => {
      setData(obj)
      window.close()
    }
  })

  console.log(formik)

  return (
    <FormShell form={formik} isCleared={false} infoVisible={false}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={formik.values.deliveryModeId && RemittanceBankInterface.PayingAgent.qry}
                parameters={
                  formik.values.deliveryModeId &&
                  `_deliveryMode=${formik.values.deliveryModeId}&_receivingCountry=${receivingCountry}&_payoutCurrency=${targetCurrency}`
                }
                name='agentCode'
                required
                label={labels.payingAgent}
                valueField='recordId'
                displayField='description'
                columnsInDropDown={[
                  { key: 'description', value: 'Paying Agent' },
                  { key: 'payingCurrency', value: 'Paying Currency' }
                ]}
                values={formik.values}
                onChange={(event, newValue) => {
                  formik.setFieldValue('agentCode', newValue?.recordId || null)
                  formik.setFieldValue('agentName', newValue?.description)
                  formik.setFieldValue('payingCurrency', newValue?.payingCurrency)
                }}
                readOnly={!formik.values.deliveryModeId}
                maxAccess={maxAccess}
                error={formik.touched.agentCode && Boolean(formik.errors.agentCode)}
              />
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </FormShell>
  )
}
