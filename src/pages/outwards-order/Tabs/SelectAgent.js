import { Grid } from '@mui/material'
import React from 'react'
import FormShell from 'src/components/Shared/FormShell'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { useForm } from 'src/hooks/form'
import { RemittanceBankInterface } from 'src/repositories/RemittanceBankInterface'

export default function SelectAgent({
  labels,
  maxAccess,
  originAmount,
  baseAmount,
  productId,
  payingCurrency,
  receivingCountry,
  agentCode,
  deliveryModeId,
  setData,
  sysDefault,
  targetCurrency,
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
      deliveryModeId: deliveryModeId,
      payingCurrency: payingCurrency
    },
    maxAccess,
    enableReinitialize: false,
    validateOnChange: true,
    onSubmit: async obj => {
      setData(obj)
      window.close()
    }
  })

  return (
    <FormShell form={formik} isCleared={false} infoVisible={false}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={RemittanceBankInterface.Combos.qryCBX}
                parameters={`_combo=1`}
                name='deliveryModeId'
                label={labels.deliveryMode}
                valueField='recordId'
                displayField='name'
                values={formik.values}
                required
                onChange={(event, newValue) => {
                  formik.setFieldValue('deliveryModeId', newValue ? newValue.recordId : '')
                  formik.setFieldValue('agentCode', null)
                  formik.setFieldValue('agentName', '')
                  formik.setFieldValue('payingCurrency', '')
                }}
                maxAccess={maxAccess}
                error={formik.touched.deliveryModeId && Boolean(formik.errors.deliveryModeId)}
              />
            </Grid>
            <Grid item xs={12}>
              <ResourceComboBox
                endpointId={formik.values.deliveryModeId && RemittanceBankInterface.PayingAgent.qry}
                parameters={
                  formik.values.deliveryModeId &&
                  `_deliveryMode=${formik.values.deliveryModeId}&_receivingCountry=${receivingCountry}&_payoutCurrency=${targetCurrency}`
                }
                name='agentCode'
                label={labels.payingAgent}
                valueField='recordId'
                required
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
