import { useContext, useEffect } from 'react'
import { Grid } from '@mui/material'
import * as yup from 'yup'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
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
import { Fixed } from 'src/components/Shared/Layouts/Fixed'

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
    'otp-expiry-time'
  ]
  useEffect(() => {
    getDataResult()
  }, [access])

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    validationSchema: yup.object({
      'otp-expiry-time': yup.number().min(30).max(120)
    }),
    initialValues: {
      'ct-nra-individual': null,
      'ct-nra-individual-ref': '',
      'ct-nra-individual-description': '',
      'ct-nra-corporate': null,
      'ct-nra-corporate-ref': '',
      'ct-nra-corporate-description': '',
      'otp-expiry-time': null,
      ct_cash_sales_ratetype_id: null,
      ct_cash_purchase_ratetype_id: null,
      ct_credit_sales_ratetype_id: null,
      ct_credit_purchase_ratetype_id: null,
      ct_credit_eval_ratetype_id: null,
      ct_minOtp_CIVAmount: null
    },
    onSubmit: async values => {
      await postRtDefault(values)
    }
  })

  const getDataResult = () => {
    const myObject = {}
    defaultsData.list.forEach(obj => {
      if (arrayAllow.includes(obj.key)) {
        myObject[obj.key] = obj.key ? parseInt(obj.value) : null
        formik.setFieldValue(obj.key, parseInt(obj.value))
      }
    })
    if (myObject && myObject['ct-nra-individual']) {
      getNumberRange(myObject['ct-nra-individual'], 'ct-nra-individual')
    }
    if (myObject && myObject['ct-nra-corporate']) {
      getNumberRange(myObject['ct-nra-corporate'], 'ct-nra-corporate')
    }
  }

  const getNumberRange = (nraId, key) => {
    var parameters = `_filter=` + '&_recordId=' + nraId
    getRequest({
      extension: SystemRepository.NumberRange.get,
      parameters: parameters
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

  const postRtDefault = async obj => {
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
    }).then(res => {
      if (res) toast.success(platformLabels.Updated)
      updateDefaults(data)
    })
  }

  const handleSubmit = () => {
    formik.handleSubmit()
  }

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={5} sx={{ pl: '10px', pt: '10px' }} xs={12}>
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
                formik && formik.setFieldValue('ct_cash_purchase_ratetype_id', newValue?.recordId || null)
              }}
              error={formik.touched.ct_cash_purchase_ratetype_id && Boolean(formik.errors.ct_cash_purchase_ratetype_id)}
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
                formik && formik.setFieldValue('ct_credit_sales_ratetype_id', newValue?.recordId || null)
              }}
              error={formik.touched.ct_credit_sales_ratetype_id && Boolean(formik.errors.ct_credit_sales_ratetype_id)}
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
                formik && formik.setFieldValue('ct_credit_purchase_ratetype_id', newValue?.recordId || null)
              }}
              error={
                formik.touched.ct_credit_purchase_ratetype_id && Boolean(formik.errors.ct_credit_purchase_ratetype_id)
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
                formik && formik.setFieldValue('ct_credit_eval_ratetype_id', newValue?.recordId || null)
              }}
              error={formik.touched.ct_credit_eval_ratetype_id && Boolean(formik.errors.ct_credit_eval_ratetype_id)}
            />
          </Grid>
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
        </Grid>
      </Grow>
      <Fixed>
        <WindowToolbar onSave={handleSubmit} isSaved={true} />
      </Fixed>
    </VertLayout>
  )
}

export default CtDefaults
