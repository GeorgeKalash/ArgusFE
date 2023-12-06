import React from 'react'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
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
import { RelationTypesRepository } from 'src/repositories/RelationTypesRepository'
import { ControlContext } from 'src/providers/ControlContext'
import { ResourceIds } from 'src/resources/ResourceIds'

const  UpdateExchangeRates = () => {

   const [countryStore,  setCountryStore] = useState([])
   const [currencyStore,  setCurrencyStore] = useState([])
   const [access , setAccess] = useState()
   const { getRequest, postRequest } = useContext(RequestsContext)
   const [exchangeTableStore, setExchangeTableStore] = useState([])
  const [CrmStore , setCrmSore] = useState([])
  const { getLabels, getAccess } = useContext(ControlContext)
  const [labels, setLabels] = useState(null)

   const exchangeRatesValidation = useFormik({
    enableReinitialize: false,
    validateOnChange: false,
    validationSchema: yup.object({
      countryId: yup.string().required('This field is required'),
      currencyId: yup.string().required('This field is required')
    }),
    initialValues: {
      currencyId: '',
      countryId: ''
    },
    onSubmit: values => {}
  })

  const _labels= {


     country: labels && labels.find(item => item.key === 1) && labels.find(item => item.key === 1).value,
     currency: labels && labels.find(item => item.key === 2) && labels.find(item => item.key === 2).value,
     exchangeTable: labels && labels.find(item => item.key === 3) && labels.find(item => item.key === 3).value,
     RCM: labels && labels.find(item => item.key === 4) && labels.find(item => item.key === 4).value,
     rates: labels && labels.find(item => item.key === 5) && labels.find(item => item.key === 5).value,
     sellMin: labels && labels.find(item => item.key === 6) && labels.find(item => item.key ===6).value,
     sellMax: labels && labels.find(item => item.key === 7) && labels.find(item => item.key === 7).value,

   }

  const exchangeRatesInlineGridColumns = [

    {
      field: 'combobox',
      header: _labels.exchangeTable,
      nameId: 'exchangeId',
      name: 'exchangeRef',
      mandatory: false,
      readOnly: true,
      store: exchangeTableStore.list,

      valueField: 'recordId',
      displayField: 'reference',
      fieldsToUpdate: [],
      columnsInDropDown: [
        { key: 'reference', value: 'Ref' },
        { key: 'name', value: 'Name' }
      ]
    },
    {
      field: 'combobox',
      header: _labels.RCM,
      nameId: 'rateCalcMethod',
      name: 'value',
      mandatory: false,
      readOnly: true,
      store: CrmStore,
      valueField: 'key',
      displayField: 'value',
      fieldsToUpdate: [],
      columnsInDropDown: [
        { key: 'value', value: 'Value' },

      ]
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

    // validate: values => {
    //   const isValid = values.rows && values.rows.every(row => !!row.plantId)
    //   const isValidExchangeId = values.rows && values.rows.every(row => !!row.exchangeId)

    //   return isValid // prevent Submit if not validate
    //     ? isValidExchangeId
    //       ? {}
    //       : { rows: Array(values.rows && values.rows.length).fill({ plantId: 'Exchange is required' }) }
    //     : { rows: Array(values.rows && values.rows.length).fill({ countryId: 'plant is required' }) }
    // },

    // initialValues: {
    //   rows: [
    //     {
    //       currencyId: exchangeRatesValidation.values.currencyId,
    //       countryId: exchangeRatesValidation.values.countryId,
    //       exchangeRef: '',
    //       rateCalcMethod:"",
    //       sellRate: '',
    //       sellMax: '',
    //       sellMin: '',
    //       exchangeRef: '',
    //       exchangeId: ''
    //     }
    //   ]
    // },
    onSubmit: values => {
      postExchangeMaps(values)
    }
  })

  const postExchangeMaps = obj => {
    const data = {

      items: obj.rows
    }
    postRequest({
      extension: RelationTypesRepository.UpdateExchangeRates.set2,
      record: JSON.stringify(data)
    })
      .then(res => {
        if (res) toast.success('Record Successfully')
      })
      .catch(error => {
        // setErrorMessage(error)
      })
  }

  useEffect(() => {
    if (!access){
      getAccess(ResourceIds.updateExchangerRates, setAccess)
   } else {
      if (access.record.maxAccess > 0) {
        getLabels(ResourceIds.updateExchangerRates, setLabels)
        fillCRMStore()

        fillCurrencyStore()
        fillCountryStore()
        fillExchangeTableStore()

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
    }
  }, [exchangeRatesValidation.values])



  const getExchangeRates = (cuId, coId) => {
    //step 1: get all commission types
    exchangeRatesGridValidation.setValues({rows: []})
    const defaultParams = `_currencyId=${cuId}&_countryId=${coId}`;
    const parameters = defaultParams;

   getRequest({
      extension: RemittanceSettingsRepository.UpdateExchangeRates.qry,
      parameters: parameters,
    }).then(exchangeTable => {

        //step 2: get all ranges commissions
        // const _productId = obj.productId
        // const _seqNo = obj.seqNo
        // const _rangeSeqNo = obj.rangeSeqNo
        var parameters = ''
        getRequest({
          extension: RelationTypesRepository.UpdateExchangeRates.qry,
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
console.log(valuesMap)


              // Combine exchangeTable and values
              const rows = exchangeTable.list.map(exchange => {
                const value = valuesMap[exchange.exchangeId] || 0;

                return {

                  exchangeId: exchange.exchangeId,
                  exchangeRef: exchange.exchangeRef,
                  exchangeName: exchange.exchangeName,
                  rateCalcMethod: exchange.rateCalcMethod,
                  rate: value.rate ? value.rate : '',
                  minRate: value.minRate ? value.minRate : '',
                  maxRate: value.maxRate? value.maxRate : '',
                };
              });

              exchangeRatesGridValidation.setValues({ rows })
              setProductLegWindowOpen(true)
          })
          .catch(error => {
            // setErrorMessage(error)
          })

      })
      .catch(error => {
        // setErrorMessage(error)
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
        extension: RelationTypesRepository.UpdateExchangeRates.qry,
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

    // if(exchangeRatesGridValidation.values.rows < 2){
    //   exchangeRatesGridValidation.setValues({
    //     rows: exchangeRows // Append new rows to the existing ones
    //   });
    // }else{
    exchangeRatesGridValidation.setValues((prevValues) => ({
      ...prevValues,
      rows: [...prevValues.rows, ...exchangeRows], // Append new rows to the existing ones
    }));

  // }

    console.log(exchangeRatesGridValidation);

    // setProductLegWindowOpen(true);
  } catch (error) {
    // setErrorMessage(error);
  }
};

// console.log(exchangeRatesGridValidation);

const handleSubmit = () => {
  exchangeRatesGridValidation.handleSubmit()
}

// Usage of getExchangeRates
// getExchangeRates(yourCuId, yourCoId);

  const fillCRMStore = () => {
    var parameters = '_database=19'
    getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: parameters
    })
      .then(res => {
        setCrmSore(res.list)
      })
      .catch(error => {})
  }


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
        // setErrorMessage(error)
      })
  }

  const fillExchangeTableStore = () => {
    var parameters = `_filter=`
    getRequest({
      extension: MultiCurrencyRepository.ExchangeTable.qry,
      parameters: parameters
    })
      .then(res => {
        setExchangeTableStore(res)
      })
      .catch(error => {
        // setErrorMessage(error)
      })
  }


  return (
    <Box>
    <CustomTabPanel index={0} value={0}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <Grid container>
          <Grid container xs={12} spacing={2}>
            <Grid item xs={6}>
              <CustomComboBox
                name='countryId'
                label={_labels.country}
                valueField='recordId'
                displayField='name'
                store={countryStore}
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
            <Grid item xs={6}></Grid>
            <Grid item xs={6}>
              <CustomComboBox
                name='currencyId'
                label={_labels.currency}
                valueField='recordId'
                displayField='name'
                store={currencyStore}
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
          </Grid>
          {exchangeRatesValidation.values.currencyId > 0 && exchangeRatesValidation.values.countryId > 0 && (
            <Grid xs={12}>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <InlineEditGrid
                  gridValidation={exchangeRatesGridValidation}
                  columns={exchangeRatesInlineGridColumns}

                  // defaultRow={{
                  //   currencyId: exchangeRatesValidation.values.currencyId
                  //     ? exchangeRatesValidation.values.currencyId
                  //     : '',
                  //   countryId: exchangeRatesValidation.values.countryId ? exchangeRatesValidation.values.countryId : '',
                  //   exchangeId: exchangeRatesGridValidation.values.exchangeId
                  //     ? exchangeRatesGridValidation.values.exchangeId
                  //     : '',

                  //   // rateCalcMethod: exchangeRatesGridValidation.values.rateCalcMethod
                  //   //   ? exchangeRatesGridValidation.values.rateCalcMethod
                  //   //   : '',
                  //   countryName: '',
                  //   exchangeRef: ''
                  // }}
                  width={'1200'}
                />
              </Box>
              <WindowToolbar onSave={handleSubmit} />
            </Grid>
          )}
        </Grid>
      </Box>
    </CustomTabPanel>
    <WindowToolbar />
  </Box>
  )
}

export default  UpdateExchangeRates
