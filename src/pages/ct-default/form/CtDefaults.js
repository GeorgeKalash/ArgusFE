import { useContext, useEffect } from 'react'
import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import FormShell from 'src/components/Shared/FormShell'
import { ResourceIds } from 'src/resources/ResourceIds'
import { CTCLRepository } from 'src/repositories/CTCLRepository'

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
  useEffect(() => {
    getDataResult()
  }, [])

  const formik = useFormik({
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
      var data = []
      Object.entries(obj).forEach(([key, value], i) => {
        if (arrayAllow.includes(key)) {
          const newObj = { key: key, value: value }
          data.push(newObj)
        }
      })

      await postRequest({
        extension: CurrencyTradingSettingsRepository.Defaults.set2,
        record: JSON.stringify({ sysDefaults: data })
      }).then(() => {
        toast.success(platformLabels.Updated)
        updateDefaults(data)
      })
    }
  })

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
    <FormShell
      resourceId={ResourceIds.CtDefaults}
      form={formik}
      maxAccess={access}
      infoVisible={false}
      isSavedClear={false}
      isCleared={false}
    >
      <VertLayout>
        <Grow>
          <Grid container spacing={3}>
            <Grid item xs={6}>
              <Grid container spacing={4}>
                <Grid item xs={12}>
                  <ResourceLookup
                    endpointId={SystemRepository.NumberRange.snapshot}
                    form={formik}
                    valueField='reference'
                    displayField='description'
                    name='ct-nra-individual-ref'
                    firstValue={formik.values['ct-nra-individual-ref']}
                    label={_labels['ct-nra-individual']}
                    secondDisplayField={true}
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
                    secondDisplayField={true}
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
                <Grid item xs={12}>
                  <ResourceComboBox
                    values={formik.values}
                    endpointId={MultiCurrencyRepository.RateType.qry}
                    name='ct_cash_sales_ratetype_id'
                    label={_labels.cash_sales_ratetype}
                    valueField='recordId'
                    displayField='name'
                    maxAccess={access}
                    onChange={(event, newValue) => {
                      formik.setFieldValue('ct_cash_sales_ratetype_id', newValue?.recordId || null)
                    }}
                    error={formik.touched.ct_cash_sales_ratetype_id && Boolean(formik.errors.ct_cash_sales_ratetype_id)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={MultiCurrencyRepository.RateType.qry}
                    values={formik.values}
                    name='ct_cash_purchase_ratetype_id'
                    label={_labels.cash_purchase_ratetype}
                    valueField='recordId'
                    displayField='name'
                    onChange={(event, newValue) => {
                      formik.setFieldValue('ct_cash_purchase_ratetype_id', newValue?.recordId || null)
                    }}
                    error={
                      formik.touched.ct_cash_purchase_ratetype_id && Boolean(formik.errors.ct_cash_purchase_ratetype_id)
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={MultiCurrencyRepository.RateType.qry}
                    values={formik.values}
                    name='ct_credit_sales_ratetype_id'
                    label={_labels.credit_sales_ratetype}
                    valueField='recordId'
                    displayField='name'
                    onChange={(event, newValue) => {
                      formik.setFieldValue('ct_credit_sales_ratetype_id', newValue?.recordId || null)
                    }}
                    error={
                      formik.touched.ct_credit_sales_ratetype_id && Boolean(formik.errors.ct_credit_sales_ratetype_id)
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={MultiCurrencyRepository.RateType.qry}
                    values={formik.values}
                    name='ct_credit_purchase_ratetype_id'
                    label={_labels.credit_purchase_ratetype}
                    valueField='recordId'
                    displayField='name'
                    onChange={(event, newValue) => {
                      formik.setFieldValue('ct_credit_purchase_ratetype_id', newValue?.recordId || null)
                    }}
                    error={
                      formik.touched.ct_credit_purchase_ratetype_id &&
                      Boolean(formik.errors.ct_credit_purchase_ratetype_id)
                    }
                  />
                </Grid>
                <Grid item xs={12}>
                  <ResourceComboBox
                    endpointId={MultiCurrencyRepository.RateType.qry}
                    values={formik.values}
                    name='ct_credit_eval_ratetype_id'
                    label={_labels.credit_eval_ratetype}
                    valueField='recordId'
                    displayField='name'
                    onChange={(event, newValue) => {
                      formik.setFieldValue('ct_credit_eval_ratetype_id', newValue?.recordId || null)
                    }}
                    error={
                      formik.touched.ct_credit_eval_ratetype_id && Boolean(formik.errors.ct_credit_eval_ratetype_id)
                    }
                  />
                </Grid>

                <Grid item xs={12}>
                  <CustomNumberField
                    name='otp-expiry-time'
                    label={_labels['otp-expiry-time']}
                    value={formik.values['otp-expiry-time']}
                    decimalScale={0}
                    maxAccess={access}
                    onChange={e => formik.setFieldValue('otp-expiry-time', e.target.value)}
                    onClear={() => formik.setFieldValue('otp-expiry-time', '')}
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
                    onClear={() => formik.setFieldValue('ct-client-trial-days', '')}
                    error={formik.touched['ct-client-trial-days'] && Boolean(formik.errors['ct-client-trial-days'])}
                    allowNegative={false}
                  />
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={6}>
              <Grid container spacing={4}>
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
    </FormShell>
  )
}

export default CtDefaults
