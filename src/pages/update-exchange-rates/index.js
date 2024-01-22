import React from 'react'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { Grid, Box} from '@mui/material'
import WindowToolbar from 'src/components/Shared/WindowToolbar'
import { useEffect, useState } from 'react'
import { useFormik } from 'formik'
import * as yup from 'yup'
import { useContext } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import { MultiCurrencyRepository } from 'src/repositories/MultiCurrencyRepository'
import { CurrencyTradingSettingsRepository } from 'src/repositories/CurrencyTradingSettingsRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceIds } from 'src/resources/ResourceIds'
import toast from 'react-hot-toast'
import ErrorWindow from 'src/components/Shared/ErrorWindow'
import { useWindowDimensions } from 'src/lib/useWindowDimensions'

const  UpdateExchangeRates = () => {

   const [countryStore,  setCountryStore] = useState([])
   const [currencyStore,  setCurrencyStore] = useState([])
   const [access , setAccess] = useState()
   const { getRequest, postRequest } = useContext(RequestsContext)
   const [exchangeTableStore, setExchangeTableStore] = useState([])
  const [CrmStore , setCrmSore] = useState([])
  const { getLabels, getAccess } = useContext(ControlContext)
  const [labels, setLabels] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const { width, height } = useWindowDimensions();

   const exchangeRatesValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      countryId: yup.string().required('This field is required'),
      currencyId: yup.string().required('This field is required')
    }),
    initialValues: {
      currencyId: '',
      countryId: '',
      exchangeId: '',
      exchangeRef: '',
      exchangeName: '',
      rateCalcMethodName: '',
      rateAgainstName: '',
      rateAgainstCurrencyRef:'',
      rate:  ''

    },
    onSubmit: values => {}
  })

  const _labels= {


     country: labels && labels.find(item => item.key === "1") && labels.find(item => item.key === "2").value,
     currency: labels && labels.find(item => item.key === "2") && labels.find(item => item.key === "1").value,
     exchangeTable: labels && labels.find(item => item.key === "3") && labels.find(item => item.key === "3").value,
     RCM: labels && labels.find(item => item.key === "4") && labels.find(item => item.key === "4").value,
     rates: labels && labels.find(item => item.key === "6") && labels.find(item => item.key === "6").value,
     sellMin: labels && labels.find(item => item.key === "5") && labels.find(item => item.key ==="5").value,
     sellMax: labels && labels.find(item => item.key === "7") && labels.find(item => item.key === "7").value,
     exchangeBuy: labels && labels.find(item => item.key === "10") && labels.find(item => item.key === "10").value,
     against: labels && labels.find(item => item.key === "9") && labels.find(item => item.key === "9").value,
     rate: labels && labels.find(item => item.key === "8") && labels.find(item => item.key === "8").value,

   }

  const exchangeRatesInlineGridColumns = [


    {
      field: 'textfield',
      header: _labels.exchangeTable,
      nameId: 'exchangeId',
      name: 'exchangeRef',
      mandatory: true,
      readOnly: true

    },

    {
      field: 'textfield',
      header: _labels.exchangeTable,
      name: 'exchangeName',
      mandatory: true,
      readOnly: true

    },
    {
      field: 'textfield',
      header: _labels.RCM,
      nameId: 'rateCalcMethod',
      name: 'rateCalcMethodName',
      mandatory: true,
      readOnly: true

    },

    {
      field: 'textfield',
      header: _labels.sellMin,
      nameId: 'minRate',
      name: 'minRate',
      mandatory: true

    },
    {
      field: 'textfield',
      header: _labels.rates,
      nameId: 'rate',
      name: 'rate',
      mandatory: true

    },
    {
      field: 'textfield',
      header: _labels.sellMax,
      nameId: 'maxRate',
      name: 'maxRate',
      mandatory: true


    }


  ]

  const exchangeRatesGridValidation = useFormik({
    enableReinitialize: true,
    validateOnChange: true,

    validate: values => {
      const isValidMin = values.rows && values.rows.every(row => !!row.maxRate)
      const isValidMax = values.rows && values.rows.every(row => !!row.minRate)
      const isValidRate = values.rows && values.rows.every(row => !!row.rate)

      const isValidExchangeId = values.rows && values.rows.every(row => !!row.minRate)

      return  (isValidMin && isValidMax & isValidRate )
          ? {}
          : { rows: Array(values.rows && values.rows.length).fill({ minRate: 'Min Rate is required', maxRate: 'Max rate is required', rate: 'Rate is required' }) }
    },


    onSubmit: values => {
      postExchangeMaps(values)
    }
  })

  const postExchangeMaps = obj => {
    const data = {

      items: obj.rows
    }
    postRequest({
      extension: CurrencyTradingSettingsRepository.UpdateExchangeRates.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) toast.success('Record Successfully')
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (!access){
      getAccess(ResourceIds.updateExchangerRates, setAccess)
   } else {
      if (access.record.maxAccess > 0) {
        getLabels(ResourceIds.updateExchangerRates, setLabels)
        fillCurrencyStore()
        fillCountryStore()

      } else {
        setErrorMessage({ message: "YOU DON'T HAVE ACCESS TO THIS SCREEN" })
      }
    }
  }, [access])



  useEffect(() => {
    if (
      exchangeRatesValidation.values &&
      exchangeRatesValidation.values.currencyId > 0 &&
      exchangeRatesValidation.values.countryId > 0
    ) {
      getExchangeRates(exchangeRatesValidation.values.currencyId, exchangeRatesValidation.values.countryId)
      fillExchangeTableStore(exchangeRatesValidation.values.currencyId, exchangeRatesValidation.values.countryId)
    }
  }, [exchangeRatesValidation.values.currencyId, exchangeRatesValidation.values.countryId ])




  const getExchangeRates = (cuId, coId) => {
    exchangeRatesGridValidation.setValues({rows: []})
    const defaultParams = `_currencyId=${cuId}&_countryId=${coId}`;
    const parameters = defaultParams;

   getRequest({
      extension: RemittanceSettingsRepository.UpdateExchangeRates.qry,
      parameters: parameters,
    }).then(exchangeTable => {

        var parameters = ''
        getRequest({
          extension: CurrencyTradingSettingsRepository.UpdateExchangeRates.qry,
          parameters: parameters,
        }).then(values => {
          console.log(values)


            // Create a mapping of commissionId to values entry for efficient lookup
              const valuesMap = values.list.reduce((acc, fee) => {
                // console.log(acc)
                // console.log(fee)
                acc[fee.exchangeId] = fee;

                return acc;
              }, {});


              // Combine exchangeTable and values
              const rows = exchangeTable.list.map(exchange => {
                const value = valuesMap[exchange.exchangeId] || 0;

                return {

                  exchangeId: exchange.exchangeId,
                  exchangeRef: exchange.exchangeRef,
                  exchangeName: exchange.exchangeName,
                  rateCalcMethod: exchange.rateCalcMethod,
                  rateCalcMethodName: exchange.rateCalcMethodName,
                  rate: value.rate ? value.rate : '',
                  minRate: value.minRate ? value.minRate : '',
                  maxRate: value.maxRate? value.maxRate : '',
                };
              });

              exchangeRatesGridValidation.setValues({ rows })
          })
          .catch(error => {
            setErrorMessage(error)
          })

      })
      .catch(error => {
        setErrorMessage(error)
      })



    //step 3: merge both
  }

const getExchangeRatess = async (cuId, coId) => {
  try {


    exchangeRatesGridValidation.setValues({rows: []})
    const defaultParams = `_currencyId=${cuId}&_countryId=${coId}`;
    const parameters = defaultParams;

    const res = await getRequest({
      extension: RemittanceSettingsRepository.UpdateExchangeRates.qry,
      parameters: parameters,
    });

    console.log(res);

    // Use Promise.all to wait for all asynchronous calls to complete
      const exchangePromises = res.list.map(async (exchangeTable) => {
      const exchangeId = exchangeTable.exchangeId;
      const exchangeName = exchangeTable.exchangeName;
      const exchangeRef = exchangeTable.exchangeRef
      const rateCalcMethod = exchangeTable.rateCalcMethod;

      // const plantId = exchangeTable.plantId;
      const defaultParams = `_exchangeId=${exchangeId}`;
      const parameters = defaultParams;

      const  exchangeResult =  getRequest({
        extension: CurrencyTradingSettingsRepository.UpdateExchangeRates.qry,
        parameters: parameters,
      });

      var obj = {
        // countryId: coId,
        // currencyId: cuId,
        // plantId: plantId,
        exchangeName: exchangeName,
        exchangeRef: exchangeRef,
        exchangeId: exchangeId,
        rateCalcMethod: rateCalcMethod,
        rate: exchangeResult.rate ? exchangeResult.rate : '',
        minRate: exchangeResult.minRate ? exchangeResult.minRate : '',
        maxRate: exchangeResult.sellMaxRate? exchangeResult.maxRate : '',
      };

      // Modify the obj or use exchangeRes.list as needed

      return obj;
    });

    const exchangeRows = await Promise.all(exchangePromises);

    exchangeRatesGridValidation.setValues((prevValues) => ({
      ...prevValues,
      rows: [...prevValues.rows, ...exchangeRows], // Append new rows to the existing ones
    }));



    console.log(exchangeRatesGridValidation);

  } catch (error) {
    setErrorMessage(error);
  }
};

const handleSubmit = () => {
  exchangeRatesGridValidation.handleSubmit()
}

// Usage of getExchangeRates
// getExchangeRates(yourCuId, yourCoId);


  const fillCurrencyStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Currency.qry,
      parameters: parameters
    })
      .then(res => {
        setCurrencyStore(res.list)
      })
      .catch(error => {})
  }

  const fillCountryStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Country.qry,
      parameters: parameters
    })
      .then(res => {
        setCountryStore(res.list)
      })
      .catch(error => {
        setErrorMessage(error)
      })
  }

  const fillExchangeTableStore = (currencyId , countryId) => {

    exchangeRatesValidation.setFieldValue('rateAgainstName' , '')
    exchangeRatesValidation.setFieldValue('rateAgainstCurrencyRef' , '')
    exchangeRatesValidation.setFieldValue('rateCalcMethodName' , '')
    exchangeRatesValidation.setFieldValue('rate' , '')
    exchangeRatesValidation.setFieldValue('exchangeRef' , '')
    exchangeRatesValidation.setFieldValue('exchangeId' ,'')
    const defaultParams = `_currencyId=${currencyId}&_countryId=${countryId}`
    var parameters = defaultParams
    getRequest({
      extension: RemittanceSettingsRepository.UpdateExchangeRates.get,
      parameters: parameters
    })
      .then(res => {
        exchangeRatesValidation.setFieldValue('exchangeRef' , res.record.exchangeRef)
        exchangeRatesValidation.setFieldValue('exchangeId' , res.record.exchangeId)


        const defaultParams = `_recordId=${res.record.exchangeId}`
        var parameters = defaultParams
        getRequest({
          extension: MultiCurrencyRepository.ExchangeTable.get,
          parameters: parameters
        })
          .then(res => {
            exchangeRatesValidation.setFieldValue('rateAgainstName' , res.record.rateAgainstName)
            exchangeRatesValidation.setFieldValue('rateAgainstCurrencyRef' , res.record.rateAgainstCurrencyRef)
            exchangeRatesValidation.setFieldValue('rateCalcMethodName' , res.record.rateCalcMethodName)

          })
          .catch(error => {
            setErrorMessage(error)
          })

          const dParams = `_exchangeId=${res.record.exchangeId}`
          var parameters = dParams
        getRequest({
          extension: CurrencyTradingSettingsRepository.UpdateExchangeRates.get,
          parameters: parameters
        })
          .then(res => {
            exchangeRatesValidation.setFieldValue('rate' , res.record.rate)

          })
          .catch(error => {
            setErrorMessage(error)
          })

      })
      .catch(error => {
        setErrorMessage(error)
      })
  }


  return (
    <Box   sx={{
      height: `${height-80}px`
     }}>
    <CustomTabPanel index={0} value={0}>
      <Box >
        <Grid container>
          <Grid container xs={12} spacing={2}>
            <Grid item xs={6}>
              <CustomComboBox
                name='countryId'
                label={_labels.country}
                valueField='recordId'

                // displayField='flName'

                displayField={['reference','name','flName']}
                store={countryStore}
                columnsInDropDown= {[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                  { key: 'flName', value: 'Foreign Language Name' }
                ]}
                value={
                  countryStore?.filter(
                    item =>
                      item.recordId === (exchangeRatesValidation.values && exchangeRatesValidation.values.countryId)
                  )[0]
                } // Ensure the value matches an option or set it to null
                required
                onChange={(event, newValue) => {
                  const selectedCurrencyId = newValue?.recordId || ''
                  exchangeRatesValidation.setFieldValue('countryId', selectedCurrencyId)

                  // Fetch and update state data based on the selected country
                }}
                error={exchangeRatesValidation.errors && Boolean(exchangeRatesValidation.errors.countryId)}
                helperText={exchangeRatesValidation.touched.countryId && exchangeRatesValidation.errors.countryId}
              />
            </Grid>
            <Grid item xs={6}>

          <CustomTextField
          name='exchange'
          label={ _labels.exchangeBuy}
          value={exchangeRatesValidation.values.exchangeRef}
          readOnly="true"
          onChange={exchangeRatesValidation.handleChange}
          error={exchangeRatesValidation.touched.exchangeRef && Boolean(addressValidation.errors.exchangeRef)}
          helperText={exchangeRatesValidation.touched.exchangeRef && addressValidation.errors.exchangeRef}
        />
          </Grid>

            <Grid item xs={6}>
              <CustomComboBox
                name='currencyId'
                label={_labels.currency}
                valueField='recordId'
                displayField='name'
                store={currencyStore}
                columnsInDropDown= {[
                  { key: 'reference', value: 'Currency Ref' },
                  { key: 'name', value: 'Name' },
                ]}
                value={
                  currencyStore.filter(
                    item =>
                      item.recordId === (exchangeRatesValidation.values && exchangeRatesValidation.values.currencyId)
                  )[0]
                } // Ensure the value matches an option or set it to null
                required
                onChange={(event, newValue) => {
                  exchangeRatesValidation.setFieldValue('currencyId', newValue?.recordId)

                  // Fetch and update state data based on the selected country
                }}
                error={exchangeRatesValidation.errors && Boolean(exchangeRatesValidation.errors.currencyId)}
                helperText={exchangeRatesValidation.touched.currencyId && exchangeRatesValidation.errors.currencyId}
              />
            </Grid>
            <Grid item xs={6}>

          <CustomTextField
          name='against'
          label={ _labels.against}
          value={exchangeRatesValidation.values.rateAgainstName}
          readOnly="true"
          onChange={exchangeRatesValidation.handleChange}
          error={exchangeRatesValidation.touched.rateAgainstName && Boolean(addressValidation.errors.rateAgainstName)}
          helperText={exchangeRatesValidation.touched.rateAgainstName && addressValidation.errors.rateAgainstName}
        />
          </Grid>
          <Grid item xs={6}>


          </Grid>
          <Grid item xs={6}>

          <CustomTextField
          name='crm'
          label={ _labels.RCM}
          value={exchangeRatesValidation.values.rateCalcMethodName}
          readOnly="true"
          onChange={exchangeRatesValidation.handleChange}
          error={exchangeRatesValidation.touched.rateCalcMethodName && Boolean(addressValidation.errors.rateCalcMethodName)}
          helperText={exchangeRatesValidation.touched.rateCalcMethodName && addressValidation.errors.rateCalcMethodName}
        />
          </Grid>
          <Grid item xs={6}>


          </Grid>
          <Grid item xs={6}>

          <CustomTextField
          name='rate'
          label={ _labels.rate}
          value={exchangeRatesValidation.values.rate}
          readOnly="true"
          onChange={exchangeRatesValidation.handleChange}
          error={exchangeRatesValidation.touched.rate && Boolean(addressValidation.errors.rate)}
          helperText={exchangeRatesValidation.touched.rate && addressValidation.errors.rate}
        />
          </Grid>
          </Grid>
          {exchangeRatesValidation.values.currencyId > 0 && exchangeRatesValidation.values.countryId > 0 && (
        <Grid xs={12} sx={{pt:2}}>
        <Box>
                <InlineEditGrid
                  gridValidation={exchangeRatesGridValidation}
                  columns={exchangeRatesInlineGridColumns}
                  allowDelete={false}
                  allowAddNewLine={false}
                  width={'1200'}
                  scrollable={true}
                  scrollHeight={`${height-350}px`}
                />
              </Box>

            </Grid>
          )}

        </Grid>
      </Box>
      <Grid sx={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  padding: 0,
                  textAlign: 'center',
                  backgroundColor: 'white'
                }}
                >
              <WindowToolbar onSave={handleSubmit} />
              </Grid>
    </CustomTabPanel>

    <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />

  </Box>
  )
}

export default  UpdateExchangeRates
