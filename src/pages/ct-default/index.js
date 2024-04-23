// ** React Imports
import { useContext, useEffect, useState } from 'react'

// ** MUI Imports
import { Box, Grid } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import toast from 'react-hot-toast'

// ** Custom Imports
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import WindowToolbar from 'src/components/Shared/WindowToolbar'

// ** API
import CustomLookup from 'src/components/Inputs/CustomLookup'
import { ControlContext } from 'src/providers/ControlContext'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'

// ** Resources
import useResourceParams from 'src/hooks/useResourceParams'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'

const Defaults = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

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
    'ct_credit_eval_ratetype_id'
  ]

  const { labels: _labels, access } = useResourceParams({
    datasetId: ResourceIds.CtDefaults
  })
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
      ct_credit_eval_ratetype_id: null
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
            myObject[obj.key] = obj.value ? parseInt(obj.value) : null
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
        // console.log(res)
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
        if (res) toast.success('Record Successfully')
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
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          marginTop: '10px'
        }}
      >
        <Grid container spacing={2} sx={{ width: '50%' }}>
          {/* First Row */}
          <Grid item xs={12}>
            <ResourceLookup
              endpointId={SystemRepository.NumberRange.snapshot}
              form={formik}
              valueField='reference'
              displayField='description'
              name='ct-nra-individual'
              firstValue={formik.values['ct-nra-individual-ref']}
              label={_labels['ct-nra-individual']}
              secondDisplayField={true}
              secondValue={formik.values['ct-nra-individual-description']}
              onChange={(event, newValue) => {
                if (newValue) {
                  formik.setFieldValue('ct-nra-individual', newValue?.recordId || '')
                  formik.setFieldValue('ct-nra-individual-ref', newValue?.reference || '')
                  formik.setFieldValue('ct-nra-individual-description', newValue?.description || '')
                } else {
                  formik.setFieldValue('ct-nra-individual', '')
                  formik.setFieldValue('ct-nra-individual-ref', '')
                  formik.setFieldValue('ct-nra-individual-description', '')
                }
              }}
              error={formik.touched['ct-nra-individual'] && Boolean(formik.errors['ct-nra-individual'])}
              helperText={formik.touched['ct-nra-individual'] && formik.errors['ct-nra-individual']}
              maxAccess={access}
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
              name='ct-nra-corporate'
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
              maxAccess={access}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomComboBox
              name='ct_cash_sales_ratetype_id'
              label={_labels.cash_sales_ratetype}
              valueField='recordId'
              displayField='name'
              store={store}
              value={
                formik.values.ct_cash_sales_ratetype_id
                  ? store.filter(item => item.recordId === formik.values.ct_cash_sales_ratetype_id)[0]
                  : ''
              }
              onChange={(event, newValue) => {
                if (newValue) formik && formik.setFieldValue('ct_cash_sales_ratetype_id', newValue?.recordId)
                else formik.setFieldValue('ct_cash_sales_ratetype_id', null)
              }}
              error={formik.touched.ct_cash_sales_ratetype_id && Boolean(formik.errors.ct_cash_sales_ratetype_id)}
              helperText={formik.touched.ct_cash_sales_ratetype_id && formik.errors.ct_cash_sales_ratetype_id}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='ct_cash_purchase_ratetype_id'
              label={_labels.cash_purchase_ratetype}
              valueField='recordId'
              displayField='name'
              store={store}
              value={
                formik.values.ct_cash_purchase_ratetype_id
                  ? store.filter(item => item.recordId === formik.values.ct_cash_purchase_ratetype_id)[0]
                  : ''
              }
              onChange={(event, newValue) => {
                if (newValue) formik && formik.setFieldValue('ct_cash_purchase_ratetype_id', newValue?.recordId)
                else formik.setFieldValue('ct_cash_purchase_ratetype_id', null)
              }}
              error={formik.touched.ct_cash_purchase_ratetype_id && Boolean(formik.errors.ct_cash_purchase_ratetype_id)}
              helperText={formik.touched.ct_cash_purchase_ratetype_id && formik.errors.ct_cash_purchase_ratetype_id}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='ct_credit_sales_ratetype_id'
              label={_labels.credit_sales_ratetype}
              valueField='recordId'
              displayField='name'
              store={store}
              value={
                formik.values.ct_credit_sales_ratetype_id
                  ? store.filter(item => item.recordId === formik.values.ct_credit_sales_ratetype_id)[0]
                  : ''
              }
              onChange={(event, newValue) => {
                if (newValue) formik && formik.setFieldValue('ct_credit_sales_ratetype_id', newValue?.recordId)
                else formik && formik.setFieldValue('ct_credit_sales_ratetype_id', '')
              }}
              error={formik.touched.ct_credit_sales_ratetype_id && Boolean(formik.errors.ct_credit_sales_ratetype_id)}
              helperText={formik.touched.ct_credit_sales_ratetype_id && formik.errors.ct_credit_sales_ratetype_id}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='ct_credit_purchase_ratetype_id'
              label={_labels.credit_purchase_ratetype}
              valueField='recordId'
              displayField='name'
              store={store}
              value={
                formik.values.ct_credit_purchase_ratetype_id
                  ? store.filter(item => item.recordId === formik.values.ct_credit_purchase_ratetype_id)[0]
                  : ''
              }
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
            <CustomComboBox
              name='ct_credit_eval_ratetype_id'
              label={_labels.credit_eval_ratetype}
              valueField='recordId'
              displayField='name'
              store={store}
              value={
                formik.values.ct_credit_eval_ratetype_id
                  ? store.filter(item => item.recordId === formik.values.ct_credit_eval_ratetype_id)[0]
                  : ''
              }
              onChange={(event, newValue) => {
                if (newValue) formik && formik.setFieldValue('ct_credit_eval_ratetype_id', newValue?.recordId)
                else formik && formik.setFieldValue('ct_credit_eval_ratetype_id', '')
              }}
              error={formik.touched.ct_credit_eval_ratetype_id && Boolean(formik.errors.ct_credit_eval_ratetype_id)}
              helperText={formik.touched.ct_credit_eval_ratetype_id && formik.errors.ct_credit_eval_ratetype_id}
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
      </Box>

      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default Defaults
