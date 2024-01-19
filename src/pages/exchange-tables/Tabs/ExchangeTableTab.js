// ** MUI Imports
import { Grid } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useState } from 'react'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

const ExchangeTableTab=({
    labels,
    exchangeTableValidation,
    currencyStore,
    fCurrencyStore,
    RCMStore,
    rateAgainstStore,
    maxAccess,
    setRateAgainst,
    rateAgainst
}) =>{


    return (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <CustomTextField
              name='reference'
              label={labels.reference}
              value={exchangeTableValidation.values.reference}
              required
              onChange={exchangeTableValidation.handleChange}
              maxLength = '10'
              maxAccess={maxAccess}
              onClear={() => exchangeTableValidation.setFieldValue('reference', '')}
              error={exchangeTableValidation.touched.reference && Boolean(exchangeTableValidation.errors.reference)}
              helperText={exchangeTableValidation.touched.reference && exchangeTableValidation.errors.reference}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={exchangeTableValidation.values.name}
              required
              maxLength = '50'
              maxAccess={maxAccess}
              onChange={exchangeTableValidation.handleChange}
              onClear={() => exchangeTableValidation.setFieldValue('name', '')}
              error={exchangeTableValidation.touched.name && Boolean(exchangeTableValidation.errors.name)}
              helperText={exchangeTableValidation.touched.name && exchangeTableValidation.errors.name}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='currencyId'
              label={labels.currency}
              valueField='recordId'
              displayField='name'
              store={currencyStore}
              value={currencyStore.filter(item => item.recordId === exchangeTableValidation.values.currencyId)[0]}
              required
              onChange={(event, newValue) => {

                exchangeTableValidation && exchangeTableValidation.setFieldValue('currencyId', newValue?.recordId);
              }}
              error={exchangeTableValidation.touched.currencyId && Boolean(exchangeTableValidation.errors.currencyId)}
              helperText={exchangeTableValidation.touched.currencyId && exchangeTableValidation.errors.currencyId}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='rateCalcMethod'
              label={labels.rcm}
              valueField='key'
              displayField='value'
              store={RCMStore}
              value={RCMStore.filter(item => item.key === exchangeTableValidation.values.rateCalcMethod?.toString())[0]}
              required
              onChange={(event, newValue) => {

                exchangeTableValidation && exchangeTableValidation.setFieldValue('rateCalcMethod', newValue?.key);
              }}
              error={exchangeTableValidation.touched.rateCalcMethod && Boolean(exchangeTableValidation.errors.rateCalcMethod)}
              helperText={exchangeTableValidation.touched.rateCalcMethod && exchangeTableValidation.errors.rateCalcMethod}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='rateAgainst'
              label={labels.rateAgainst}
              valueField='key'
              displayField='value'
              store={rateAgainstStore}
              value={rateAgainstStore.filter(item => item.key === exchangeTableValidation.values.rateAgainst?.toString())[0]}
              required
              onChange={(event, newValue) => {
                // exchangeTableValidation.setFieldValue('rateAgainst','');
                exchangeTableValidation && exchangeTableValidation.setFieldValue('rateAgainst', newValue?.key);
                console.log(exchangeTableValidation)

                newValue?.key && setRateAgainst(newValue?.key)
                newValue?.key=== "1" && exchangeTableValidation.setFieldValue('rateAgainstCurrencyId', '');
              }}
              error={exchangeTableValidation.touched.rateAgainst && Boolean(exchangeTableValidation.errors.rateAgainst)}
              helperText={exchangeTableValidation.touched.rateAgainst && exchangeTableValidation.errors.rateAgainst}
            />
          </Grid>


          <Grid item xs={12}>
            <CustomComboBox
              name='rateAgainstCurrencyId'
              label={labels.fCurrency}
              valueField='recordId'
              displayField='name'
              store={currencyStore}

              value={exchangeTableValidation.values.rateAgainstCurrencyId && currencyStore.filter(item => item.recordId === exchangeTableValidation.values.rateAgainstCurrencyId)[0]}
              required={exchangeTableValidation.values.rateAgainst ==="2" && true}

              readOnly={!exchangeTableValidation.values.rateAgainstCurrencyId && exchangeTableValidation.values.rateAgainst !=="2" ? true : false}

              onChange={(event, newValue) => {

                exchangeTableValidation && exchangeTableValidation.setFieldValue('rateAgainstCurrencyId', newValue?.recordId);

              }}
              error={exchangeTableValidation.touched.rateAgainstCurrencyId  && Boolean(exchangeTableValidation.errors.rateAgainstCurrencyId)}
              helperText={exchangeTableValidation.touched.rateAgainstCurrencyId  && exchangeTableValidation.errors.rateAgainstCurrencyId}
            />
          </Grid>

          </Grid>
    )
}

export default ExchangeTableTab
