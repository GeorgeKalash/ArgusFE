import { Grid } from '@mui/material'
import React from 'react'
import Form from '@argus/shared-ui/src/components/Shared/Form'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { RemittanceBankInterface } from '@argus/repositories/src/repositories/RemittanceBankInterface'
import * as yup from 'yup'

const SelectAgent = ({
  labels,
  maxAccess,
  setData,
  values: {
    originAmount,
    baseAmount,
    productId,
    payingCurrency,
    receivingCountry,
    agentCode,
    targetCurrency,
    agentDeliveryMode
  },
  window
}) => {
  const { formik } = useForm({
    initialValues: {
      agentCode,
      agentName: '',
      productId,
      fees: null,
      exRate: 1,
      originAmount,
      baseAmount,
      bankName: '',
      bankNameCode: '',
      deliveryModeId: agentDeliveryMode,
      payingCurrency
    },
    maxAccess,
    validateOnChange: true,
    validationSchema: yup.object({
      agentCode: yup.string().required()
    }),
    onSubmit: async obj => {
      setData(obj)
      window.close()
    }
  })

  return (
    <Form onSave={formik.handleSubmit} maxAccess={maxAccess}>
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
    </Form>
  )
}

SelectAgent.width = 500
SelectAgent.height = 200

export default SelectAgent
