import { useContext, useEffect } from 'react'
import { Grid } from '@mui/material'
import * as yup from 'yup'
import toast from 'react-hot-toast'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { MultiCurrencyRepository } from '@argus/repositories/src/repositories/MultiCurrencyRepository'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { ResourceLookup } from '@argus/shared-ui/src/components/Shared/ResourceLookup'
import ResourceComboBox from '@argus/shared-ui/src/components/Shared/ResourceComboBox'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { CTCLRepository } from '@argus/repositories/src/repositories/CTCLRepository'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { CurrencyTradingSettingsRepository } from '@argus/repositories/src/repositories/CurrencyTradingSettingsRepository'
import Form from '@argus/shared-ui/src/components/Shared/Form'

const CtDefaults = ({ _labels, access }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { platformLabels, defaultsData, updateDefaults } = useContext(ControlContext)

  const arrayAllow = [
    'ct-nra-individual',
    'ct-nra-corporate',
    'ct_cash_sales_ratetype_id',
    'ct_cash_purchase_ratetype_id',
    'ct_credit_sales_ratetype_id',
    'ct_credit_purchase_ratetype_id',
    'ct_credit_eval_ratetype_id',
    'ct_minOtp_CIVAmount',
    'otp-expiry-time',
    'ct-client-trial-days',
    'ct_min_client_CIVAmount',
    'ct_default_civ_client',
    'ct_default_civ_clientRef',
    'ct_default_civ_clientName'
  ]

  const { formik } = useForm({
    maxAccess: access,
    validateOnChange: true,
    validationSchema: yup.object({
      'otp-expiry-time': yup.number().min(30).max(120).nullable(true),
      'ct-client-trial-days': yup.number().min(0).max(180).nullable(true)
    }),
    initialValues: {
      'ct-nra-individual': null,
      'ct-nra-corporate': null,
      'otp-expiry-time': null,
      ct_cash_sales_ratetype_id: null,
      ct_cash_purchase_ratetype_id: null,
      ct_credit_sales_ratetype_id: null,
      ct_credit_purchase_ratetype_id: null,
      ct_credit_eval_ratetype_id: null,
      ct_minOtp_CIVAmount: null,
      'ct-client-trial-days': null,
      ct_min_client_CIVAmount: null,
      ct_default_civ_client: null,
      ct_default_civ_clientRef: null,
      ct_default_civ_clientName: null
    },
    onSubmit: async obj => {
      const data = Object.entries(obj)
        .filter(([key]) => arrayAllow.includes(key))
        .map(([key, value]) => ({ key, value }))

      await postRequest({
        extension: CurrencyTradingSettingsRepository.Defaults.set2,
        record: JSON.stringify({ sysDefaults: data })
      })
      updateDefaults(data)
      toast.success(platformLabels.Updated)
    }
  })

  useEffect(() => {
    getDataResult()
  }, [defaultsData])

  const getDataResult = () => {
    const myObject = {}

    defaultsData.list.forEach(obj => {
      if (arrayAllow.includes(obj.key)) {
        const parsedValue = obj.value ? parseInt(obj.value, 10) : null
        if (formik.values[obj.key] !== parsedValue) {
          myObject[obj.key] = parsedValue
          formik.setFieldValue(obj.key, parsedValue)
        }
      }

      if (['ct_default_civ_clientName', 'ct_default_civ_clientRef'].includes(obj.key)) {
        const value = obj.value || null
        if (formik.values[obj.key] !== value) {
          myObject[obj.key] = value
          formik.setFieldValue(obj.key, value)
        }
      }
    })
    ;['ct-nra-individual', 'ct-nra-corporate'].forEach(key => {
      if (myObject[key]) {
        getNumberRange(myObject[key], key)
      }
    })
  }

  const getNumberRange = (nraId, key) => {
    getRequest({
      extension: SystemRepository.NumberRange.get,
      parameters: `_filter=&_recordId=${nraId}`
    }).then(res => {
      if (key === 'ct-nra-individual') {
        formik.setFieldValue('ct-nra-individual', res.record.recordId)
        formik.setFieldValue('ct-nra-individual-ref', res.record.reference)
        formik.setFieldValue('ct-nra-individual-description', res.record.description)
      }
      if (key === 'ct-nra-corporate') {
        formik.setFieldValue('ct-nra-corporate', res.record.recordId)
        formik.setFieldValue('ct-nra-corporate-ref', res.record.reference)
        formik.setFieldValue('ct-nra-corporate-description', res.record.description)
      }
    })
  }

  return (
    <Form onSave={formik.handleSubmit} maxAccess={access}>
      <VertLayout>
        <Grow>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={SystemRepository.NumberRange.snapshot}
                    form={formik}
                    valueField='reference'
                    displayField='description'
                    name='ct-nra-individual-ref'
                    firstValue={formik.values['ct-nra-individual-ref']}
                    label={_labels['ct-nra-individual']}
                    secondDisplayField
                    secondValue={formik.values['ct-nra-individual-description']}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('ct-nra-individual', newValue?.recordId || null)
                      formik.setFieldValue('ct-nra-individual-ref', newValue?.reference || '')
                      formik.setFieldValue('ct-nra-individual-description', newValue?.description || '')
                    }}
                    error={formik.touched['ct-nra-individual'] && Boolean(formik.errors['ct-nra-individual'])}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={SystemRepository.NumberRange.snapshot}
                    name='ct-nra-corporate-ref'
                    form={formik}
                    label={_labels['ct-nra-corporate']}
                    valueField='reference'
                    displayField='description'
                    secondDisplayField
                    firstValue={formik.values['ct-nra-corporate-ref']}
                    secondValue={formik.values['ct-nra-corporate-description']}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('ct-nra-corporate', newValue?.recordId || null)
                      formik.setFieldValue('ct-nra-corporate-ref', newValue?.reference || '')
                      formik.setFieldValue('ct-nra-corporate-description', newValue?.description || '')
                    }}
                    error={formik.touched['ct-nra-corporate'] && Boolean(formik.errors['ct-nra-corporate'])}
                  />
                </Grid>
                {[
                  { name: 'ct_cash_sales_ratetype_id', label: _labels.cash_sales_ratetype },
                  { name: 'ct_cash_purchase_ratetype_id', label: _labels.cash_purchase_ratetype },
                  { name: 'ct_credit_sales_ratetype_id', label: _labels.credit_sales_ratetype },
                  { name: 'ct_credit_purchase_ratetype_id', label: _labels.credit_purchase_ratetype },
                  { name: 'ct_credit_eval_ratetype_id', label: _labels.credit_eval_ratetype }
                ].map(item => (
                  <Grid item xs={12} key={item.name}>
                    <ResourceComboBox
                      endpointId={MultiCurrencyRepository.RateType.qry}
                      values={formik.values}
                      name={item.name}
                      label={item.label}
                      valueField='recordId'
                      displayField='name'
                      maxAccess={access}
                      onChange={(event, newValue) => {
                        formik.setFieldValue(item.name, newValue?.recordId || null)
                      }}
                      error={formik.touched[item.name] && Boolean(formik.errors[item.name])}
                    />
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <CustomNumberField
                    name='otp-expiry-time'
                    label={_labels['otp-expiry-time']}
                    value={formik.values['otp-expiry-time']}
                    decimalScale={0}
                    maxAccess={access}
                    onChange={e => formik.setFieldValue('otp-expiry-time', e.target.value)}
                    onClear={() => formik.setFieldValue('otp-expiry-time', null)}
                    error={formik.touched['otp-expiry-time'] && Boolean(formik.errors['otp-expiry-time'])}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='ct-client-trial-days'
                    label={_labels.phone}
                    value={formik.values['ct-client-trial-days']}
                    maxAccess={access}
                    onChange={e => formik.setFieldValue('ct-client-trial-days', e.target.value)}
                    onClear={() => formik.setFieldValue('ct-client-trial-days', null)}
                    error={formik.touched['ct-client-trial-days'] && Boolean(formik.errors['ct-client-trial-days'])}
                    allowNegative={false}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='ct_minOtp_CIVAmount'
                    label={_labels.minimumOtp}
                    value={formik.values.ct_minOtp_CIVAmount}
                    maxAccess={access}
                    onChange={e => formik.setFieldValue('ct_minOtp_CIVAmount', e.target.value)}
                    onClear={() => formik.setFieldValue('ct_minOtp_CIVAmount', '')}
                    error={formik.touched.ct_minOtp_CIVAmount && Boolean(formik.errors.ct_minOtp_CIVAmount)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <CustomNumberField
                    name='ct_min_client_CIVAmount'
                    label={_labels.minMandatory}
                    value={formik.values.ct_min_client_CIVAmount}
                    maxAccess={access}
                    onChange={e => formik.setFieldValue('ct_min_client_CIVAmount', e.target.value)}
                    onClear={() => formik.setFieldValue('ct_min_client_CIVAmount', '')}
                    allowNegative={false}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={CTCLRepository.CtClientIndividual.snapshot}
                    parameters={{ _category: 1 }}
                    name='ct_default_civ_client'
                    label={_labels.client}
                    valueField='reference'
                    displayField='name'
                    displayFieldWidth={2}
                    valueShow='ct_default_civ_clientRef'
                    secondValueShow='ct_default_civ_clientName'
                    form={formik}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('ct_default_civ_client', newValue ? newValue.recordId : '')
                      formik.setFieldValue('ct_default_civ_clientRef', newValue ? newValue.reference : '')
                      formik.setFieldValue('ct_default_civ_clientName', newValue ? newValue.name : '')
                    }}
                    maxAccess={access}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grow>
      </VertLayout>
    </Form>
  )
}

export default CtDefaults
