// ** React Imports
import { useContext, useEffect, useState } from 'react'

// ** MUI Imports
import { Box, Grid } from '@mui/material'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import useResourceParams from 'src/hooks/useResourceParams'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'

const CtDefaults = ({ _labels, access }) => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)
  const { platformLabels } = useContext(ControlContext)

  //control
  const [labels, setLabels] = useState(null)
  const [numberRangeStore, setNumberRangeStore] = useState([])
  const [store, setStore] = useState([])
  const [errorMessage, setErrorMessage] = useState(null)

  const arrayAllow = [
    'ct-nra-individual',
    'ct-nra-corporate',
    'ct_cash_sales_ratetype_id',
    'ct_cash_purchase_ratetype_id',
    'ct_credit_sales_ratetype_id',
    'ct_credit_purchase_ratetype_id',
    'ct_credit_eval_ratetype_id',
    'ct_minOtp_CIVAmount'
  ]

  useEffect(() => {
    getDataResult()
    getData()
  }, [access])

  const formik = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      'ct-nra-individual': null,
      'ct-nra-individual-ref': null,
      'ct-nra-individual-description': null,
      'ct-nra-corporate': null,
      'ct-nra-corporate-ref': null,
      'ct-nra-corporate-description': null,
      ct_cash_sales_ratetype_id: null,
      ct_cash_purchase_ratetype_id: null,
      ct_credit_sales_ratetype_id: null,
      ct_credit_purchase_ratetype_id: null,
      ct_credit_eval_ratetype_id: null,
      ct_minOtp_CIVAmount: null
    },
    onSubmit: values => {
      postRtDefault(values)
    }
  })

  const getDataResult = () => {
    var parameters = `_filter=`
    getRequest({
      extension: CurrencyTradingSettingsRepository.Defaults.qry,
      parameters: parameters
    })
      .then(res => {
        const myObject = {}
        res.list.forEach(obj => {
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
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const getNumberRange = (nraId, key) => {
    var parameters = `_filter=` + '&_recordId=' + nraId
    getRequest({
      extension: SystemRepository.NumberRange.get,
      parameters: parameters
    })
      .then(res => {
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
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const postRtDefault = obj => {
    var data = []
    Object.entries(obj).forEach(([key, value], i) => {
      if (arrayAllow.includes(key)) {
        const newObj = { key: key, value: value }
        data.push(newObj)
      }
    })

    postRequest({
      extension: CurrencyTradingSettingsRepository.Defaults.set2,
      record: JSON.stringify({ sysDefaults: data })
    })
      .then(res => {
        if (res) toast.success(platformLabels.Updated)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const handleSubmit = () => {
    formik.handleSubmit()
  }

  const getData = () => {
    // Clone the current state

    var parameters = `_filter=`
    getRequest({
      extension: MultiCurrencyRepository.RateType.qry,
      parameters: parameters
    })
      .then(res => {
        setStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const lookupNumberRange = searchQry => {
    var parameters = `_size=30&_startAt=0&_filter=${searchQry}`
    getRequest({
      extension: SystemRepository.NumberRange.snapshot,
      parameters: parameters
    })
      .then(res => {
        setNumberRangeStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={3} sx={{ width: '95%', pt: '1rem', ml: '0.5rem' }}>
          {/* First Row */}
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
                if (newValue) {
                  formik.setFieldValue('ct-nra-individual', newValue?.recordId)
                  formik.setFieldValue('ct-nra-individual-ref', newValue?.reference)
                  formik.setFieldValue('ct-nra-individual-description', newValue?.description)
                } else {
                  formik.setFieldValue('ct-nra-individual', '')
                  formik.setFieldValue('ct-nra-individual-ref', '')
                  formik.setFieldValue('ct-nra-individual-description', '')
                }
              }}
              error={formik.touched['ct-nra-individual'] && Boolean(formik.errors['ct-nra-individual'])}
              helperText={formik.touched['ct-nra-individual'] && formik.errors['ct-nra-individual']}
            />
          </Grid>

          {/* <ResourceLookup
             endpointId={SystemRepository.NumberRange.snapshot}
             form={formik}
             valueField='reference'
             displayField='description'
             name='nraRef'
             label={labels.numberRange}
             secondDisplayField={true}
             secondValue={formik.values.nraDescription}
             onChange={(event, newValue) => {

              if (newValue) {
                formik.setFieldValue('nraId', newValue?.recordId)
                formik.setFieldValue('nraRef', newValue?.reference)
                formik.setFieldValue('nraDescription', newValue?.description)
                
              } else {
                formik.setFieldValue('nraId', null)
                formik.setFieldValue('nraRef', '')
                formik.setFieldValue('nraDescription', '')

              }
            }} */}

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
                if (newValue) {
                  formik.setFieldValue('ct-nra-corporate', newValue?.recordId)
                  formik.setFieldValue('ct-nra-corporate-ref', newValue?.reference)
                  formik.setFieldValue('ct-nra-corporate-description', newValue?.description)
                } else {
                  formik.setFieldValue('ct-nra-corporate', '')
                  formik.setFieldValue('ct-nra-corporate-ref', '')
                  formik.setFieldValue('ct-nra-corporate-description', '')
                }
              }}
              error={formik.touched['ct-nra-corporate'] && Boolean(formik.errors['ct-nra-corporate'])}
              helperText={formik.touched['ct-nra-corporate'] && formik.errors['ct-nra-corporate']}
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
                formik && formik.setFieldValue('ct_cash_sales_ratetype_id', newValue?.recordId)
              }}
              error={formik.touched.ct_cash_sales_ratetype_id && Boolean(formik.errors.ct_cash_sales_ratetype_id)}
              helperText={formik.touched.ct_cash_sales_ratetype_id && formik.errors.ct_cash_sales_ratetype_id}
            />
          </Grid>

          {/* <ResourceComboBox
                        endpointId={MultiCurrencyRepository.RateType.qry}
                        name='mc_defaultRTFI'
                        label={_labels.mc_defaultRTFI}
                        valueField='recordId'
                        displayField='name'
                        values={formik.values}
                        onChange={(event, newValue) => {
                            formik && formik.setFieldValue('mc_defaultRTFI', newValue?.recordId)
                        }}
                        error={formik.touched.mc_defaultRTFI && Boolean(formik.errors.mc_defaultRTFI)}

                        // helperText={formik.touched.mc_defaultRTFI && formik.errors.mc_defaultRTFI}
                        /> */}

          <Grid item xs={12}>
            <ResourceComboBox
              endpointId={MultiCurrencyRepository.RateType.qry}
              values={formik.values}
              name='ct_cash_purchase_ratetype_id'
              label={_labels.cash_purchase_ratetype}
              valueField='recordId'
              displayField='name'
              onChange={(event, newValue) => {
                if (newValue) formik && formik.setFieldValue('ct_cash_purchase_ratetype_id', newValue?.recordId)
                else formik.setFieldValue('ct_cash_purchase_ratetype_id', null)
              }}
              error={formik.touched.ct_cash_purchase_ratetype_id && Boolean(formik.errors.ct_cash_purchase_ratetype_id)}
              helperText={formik.touched.ct_cash_purchase_ratetype_id && formik.errors.ct_cash_purchase_ratetype_id}
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
                if (newValue) formik && formik.setFieldValue('ct_credit_sales_ratetype_id', newValue?.recordId)
                else formik && formik.setFieldValue('ct_credit_sales_ratetype_id', '')
              }}
              error={formik.touched.ct_credit_sales_ratetype_id && Boolean(formik.errors.ct_credit_sales_ratetype_id)}
              helperText={formik.touched.ct_credit_sales_ratetype_id && formik.errors.ct_credit_sales_ratetype_id}
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
                if (newValue) formik && formik.setFieldValue('ct_credit_purchase_ratetype_id', newValue?.recordId)
                else formik && formik.setFieldValue('ct_credit_purchase_ratetype_id', '')
              }}
              error={
                formik.touched.ct_credit_purchase_ratetype_id && Boolean(formik.errors.ct_credit_purchase_ratetype_id)
              }
              helperText={formik.touched.ct_credit_purchase_ratetype_id && formik.errors.ct_credit_purchase_ratetype_id}
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
                if (newValue) formik && formik.setFieldValue('ct_credit_eval_ratetype_id', newValue?.recordId)
                else formik && formik.setFieldValue('ct_credit_eval_ratetype_id', '')
              }}
              error={formik.touched.ct_credit_eval_ratetype_id && Boolean(formik.errors.ct_credit_eval_ratetype_id)}
              helperText={formik.touched.ct_credit_eval_ratetype_id && formik.errors.ct_credit_eval_ratetype_id}
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
        </Grid>
        <Grid
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            width: '100%',
            padding: 3,
            textAlign: 'center'
          }}
        >
          <WindowToolbar onSave={handleSubmit} isSaved={true} />
        </Grid>
      </Grow>
      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </VertLayout>
  )
}

export default CtDefaults
