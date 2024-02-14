// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'
import toast from 'react-hot-toast'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import Window from 'src/components/Shared/Window'
import WindowToolbar from 'src/components/Shared/WindowToolbar'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { ControlContext } from 'src/providers/ControlContext'
import { CommonContext } from 'src/providers/CommonContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import CustomLookup from 'src/components/Inputs/CustomLookup'

// ** Resources
import { ResourceIds } from 'src/resources/ResourceIds'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { position } from 'stylis'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'

const Defaults = () => {
  const { getRequest, postRequest } = useContext(RequestsContext)
  const { getLabels, getAccess } = useContext(ControlContext)

  //control
  const [labels, setLabels] = useState(null)
  const [access, setAccess] = useState(null)
  const [numberRangeStore, setNumberRangeStore] = useState([])
  const[store, setStore] = useState([])

const [ initialValues, setInitialValues] = useState({
  'ct-nra-individual' : null,
  'ct-nra-corporate': null,
  nraId: null, nraRef: null, nraDescription: null, // ct-nra-individual
  nraId2: null, nraRef2: null, nraDescription2: null,  //ct-nra-corporate
  ct_cash_sales_ratetype_id : null,
  ct_cash_purchase_ratetype_id : null,
  ct_credit_sales_ratetype_id : null,
  ct_credit_purchase_ratetype_id : null

 })

  //stores

  const [errorMessage, setErrorMessage] = useState(null)




  useEffect(() => {
    if (!access) getAccess(ResourceIds.CtDefaults, setAccess)
    else {
      if (access.record.maxAccess > 0) {
        getLabels(ResourceIds.CtDefaults, setLabels)

        getDataResult()
        getData()

      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }

    // getDataResult()
  }, [access])

  const _labels = {
    nri: labels && labels.find(item => item.key === "1")?.value,
    nrc: labels && labels.find(item => item.key ==="2")?.value,
    cash_sales_ratetype
: labels && labels.find(item => item.key === "cash_sales_ratetype")?.value,
cash_purchase_ratetype: labels && labels.find(item => item.key ==="cash_purchase_ratetype")?.value,
credit_purchase_ratetype
: labels && labels.find(item => item.key === "credit_purchase_ratetype")?.value,
credit_sales_ratetype: labels && labels.find(item => item.key ==="credit_sales_ratetype")?.value

  }

  const rtDefaultValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues: {
      'ct-nra-individual': null,
      "ct_cash_sales_ratetype_id" : null,
      'ct_cash_purchase_ratetype_id' : null,
      "ct_credit_sales_ratetype_id" : null,
      "ct_credit_purchase_ratetype_id" : null

      },
    onSubmit: values => {

      postRtDefault(values)
    }
  })

  const rtDefaultFormValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,
    initialValues,
    onSubmit: values => {
      // postRtDefault(values)
    }
  })
console.log(rtDefaultFormValidation)

   const getDataResult = () => {


    var parameters = `_filter=`
    getRequest({
      extension:  CurrencyTradingSettingsRepository.Defaults.qry,
      parameters: parameters
     })
      .then(res => {
        const myObject = { ...initialValues }; // Clone the current state
        res.list.forEach(obj => {
          if (obj.key in myObject) {
             myObject[obj.key] = obj.value ? parseInt(obj.value) : null;
            rtDefaultFormValidation.setFieldValue(obj.key,parseInt(obj.value) )
            rtDefaultValidation.setFieldValue(obj.key, parseInt(obj.value) )

          }
        });

        if(myObject && myObject['ct-nra-individual']){
          getNumberRange(myObject['ct-nra-individual'] , 'ct-nra-individual')
        }

        if(myObject && myObject['ct-nra-corporate']){
          getNumberRange(myObject['ct-nra-corporate'], "ct-nra-corporate")
        }



      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const getNumberRange = (nraId , key) => {
    var parameters = `_filter=` + '&_recordId=' + nraId
    getRequest({
      extension: SystemRepository.NumberRange.get,
      parameters: parameters
    })
      .then(res => {
        // console.log(res)
        if(key==='ct-nra-individual'){
        rtDefaultValidation.setFieldValue('ct-nra-individual' , res.record.recordId)
        rtDefaultFormValidation.setFieldValue('nraId' , res.record.recordId)
        rtDefaultFormValidation.setFieldValue('nraRef' , res.record.reference)
        rtDefaultFormValidation.setFieldValue('nraDescription' , res.record.description)
      }
      if(key==='ct-nra-corporate'){

        rtDefaultValidation.setFieldValue('ct-nra-corporate' , res.record.recordId)

        rtDefaultFormValidation.setFieldValue('nraId2' , res.record.recordId)
        rtDefaultFormValidation.setFieldValue('nraRef2' , res.record.reference)
        rtDefaultFormValidation.setFieldValue('nraDescription2' , res.record.description)
      }




      })
      .catch(error => {
        setErrorMessage(error)
      })
  }









  const postRtDefault = obj => {

   var data = []
    Object.entries(obj).forEach(([key, value], i) => {
      // console.log(`Key: ${key}, Value: ${value}`);
      const newObj = { key: key  , value : value };

      // Push the new object into the array
      data.push(newObj);

    })

      postRequest({
        extension: CurrencyTradingSettingsRepository.Defaults.set2,
        record:   JSON.stringify({  sysDefaults  : data })
      })
        .then(res => {
          if (res) toast.success('Record Successfully')
        })
        .catch(error => {
          setErrorMessage(error)
        })
  }

  const handleSubmit = () => {
    rtDefaultValidation.handleSubmit()
  }

  const getData = () => {
    // Clone the current state

        var parameters = `_filter=`
        getRequest({
          extension:  MultiCurrencyRepository.RateType.qry,
          parameters: parameters
        })
        .then(res => {
          setStore(res.list);
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
         <Grid container spacing={2} sx={{width : '50%'}}>
      {/* First Row */}
      <Grid item xs={12}>
                <CustomLookup
                  name='ct-nra-individual'
                  label={_labels.nri}
                  valueField='reference'
                  displayField='description'
                  store={numberRangeStore}

                  setStore={setNumberRangeStore}

                  firstValue={rtDefaultFormValidation.values.nraRef}
                  secondValue={rtDefaultFormValidation.values.nraDescription}
                  onLookup={lookupNumberRange}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      rtDefaultValidation.setFieldValue('ct-nra-individual', newValue?.recordId)

                      rtDefaultFormValidation.setFieldValue('nraId', newValue?.recordId)
                      rtDefaultFormValidation.setFieldValue('nraRef', newValue?.reference)
                      rtDefaultFormValidation.setFieldValue('nraDescription', newValue?.description)
                    } else {
                      rtDefaultValidation.setFieldValue('ct-nra-individual', '')
                      rtDefaultFormValidation.setFieldValue('nraId', null)
                      rtDefaultFormValidation.setFieldValue('nraRef', null)
                      rtDefaultFormValidation.setFieldValue('nraDescription', null)
                    }
                  }}

                  error={rtDefaultFormValidation.touched.nraId && Boolean(rtDefaultFormValidation.errors.nraId)}
                  helperText={rtDefaultFormValidation.touched.nraId && rtDefaultFormValidation.errors.nraId}
                  maxAccess={access}
                />
              </Grid>

              <Grid item xs={12}>
                <CustomLookup
                  name='ct-nra-corporate'
                  label={_labels.nrc}
                  valueField='reference'
                  displayField='description'
                  store={numberRangeStore}

                  setStore={setNumberRangeStore}

                  firstValue={rtDefaultFormValidation.values.nraRef2}
                  secondValue={rtDefaultFormValidation.values.nraDescription2}
                  onLookup={lookupNumberRange}
                  onChange={(event, newValue) => {
                    if (newValue) {
                      rtDefaultValidation.setFieldValue('ct-nra-corporate', newValue?.recordId)

                      rtDefaultFormValidation.setFieldValue('nraId2', newValue?.recordId)
                      rtDefaultFormValidation.setFieldValue('nraRef2', newValue?.reference)
                      rtDefaultFormValidation.setFieldValue('nraDescription2', newValue?.description)
                    } else {
                      rtDefaultValidation.setFieldValue('ct-nra-corporate', '')
                      rtDefaultFormValidation.setFieldValue('nraId2', null)
                      rtDefaultFormValidation.setFieldValue('nraRef2', null)
                      rtDefaultFormValidation.setFieldValue('nraDescription2', null)
                    }
                  }}

                  error={rtDefaultFormValidation.touched.nraId2 && Boolean(rtDefaultFormValidation.errors.nraId2)}
                  helperText={rtDefaultFormValidation.touched.nraId2 && rtDefaultFormValidation.errors.nraId2}
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

                        value={rtDefaultValidation.values.ct_cash_sales_ratetype_id && store.filter(item => item.recordId === rtDefaultValidation.values.ct_cash_sales_ratetype_id)[0]}
                        onChange={(event, newValue) => {
                            rtDefaultValidation && rtDefaultValidation.setFieldValue('ct_cash_sales_ratetype_id', newValue?.recordId)
                        }}
                        error={rtDefaultValidation.touched.ct_cash_sales_ratetype_id && Boolean(rtDefaultValidation.errors.ct_cash_sales_ratetype_id)}
                        helperText={rtDefaultValidation.touched.ct_cash_sales_ratetype_id && rtDefaultValidation.errors.ct_cash_sales_ratetype_id}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <CustomComboBox
                        name='ct_cash_purchase_ratetype_id'
                        label={_labels.cash_purchase_ratetype}
                        valueField='recordId'
                        displayField='name'
                        store={store}

                        value={rtDefaultValidation.values.ct_cash_purchase_ratetype_id && store.filter(item => item.recordId === rtDefaultValidation.values.ct_cash_purchase_ratetype_id)[0]}
                        onChange={(event, newValue) => {
                            rtDefaultValidation && rtDefaultValidation.setFieldValue('ct_cash_purchase_ratetype_id', newValue?.recordId)
                        }}
                        error={rtDefaultValidation.touched.ct_cash_purchase_ratetype_id && Boolean(rtDefaultValidation.errors.ct_cash_purchase_ratetype_id)}
                        helperText={rtDefaultValidation.touched.ct_cash_purchase_ratetype_id && rtDefaultValidation.errors.ct_cash_purchase_ratetype_id}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <CustomComboBox
                        name='ct_credit_sales_ratetype_id'
                        label={_labels.credit_sales_ratetype}
                        valueField='recordId'
                        displayField='name'
                        store={store}

                        value={rtDefaultValidation.values.ct_credit_sales_ratetype_id && store.filter(item => item.recordId === rtDefaultValidation.values.ct_credit_sales_ratetype_id)[0]}
                        onChange={(event, newValue) => {
                            rtDefaultValidation && rtDefaultValidation.setFieldValue('ct_credit_sales_ratetype_id', newValue?.recordId)
                        }}
                        error={rtDefaultValidation.touched.ct_credit_sales_ratetype_id && Boolean(rtDefaultValidation.errors.ct_credit_sales_ratetype_id)}
                        helperText={rtDefaultValidation.touched.ct_credit_sales_ratetype_id && rtDefaultValidation.errors.ct_credit_sales_ratetype_id}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <CustomComboBox
                        name='ct_credit_purchase_ratetype_id'
                        label={_labels.credit_purchase_ratetype}
                        valueField='recordId'
                        displayField='name'
                        store={store}

                        value={rtDefaultValidation.values.ct_credit_purchase_ratetype_id && store.filter(item => item.recordId === rtDefaultValidation.values.ct_credit_purchase_ratetype_id)[0]}
                        onChange={(event, newValue) => {
                            rtDefaultValidation && rtDefaultValidation.setFieldValue('ct_credit_purchase_ratetype_id', newValue?.recordId)
                        }}
                        error={rtDefaultValidation.touched.ct_credit_purchase_ratetype_id && Boolean(rtDefaultValidation.errors.ct_credit_purchase_ratetype_id)}
                        helperText={rtDefaultValidation.touched.ct_credit_purchase_ratetype_id && rtDefaultValidation.errors.ct_credit_purchase_ratetype_id}
                        />
                    </Grid>

              </Grid>
              <Grid sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          padding: 3,
          textAlign: 'center',
        }}>
              <WindowToolbar onSave={handleSubmit}  />
              </Grid>

      </Box>


      <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
    </>
  )
}

export default Defaults
