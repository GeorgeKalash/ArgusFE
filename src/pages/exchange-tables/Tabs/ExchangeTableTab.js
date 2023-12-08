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
    rateAgainstStore,
    maxAccess
}) =>{


const [position, setPosition] = useState()

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

                exchangeTableValidation && exchangeTableValidation.setFieldValue('currencyId', newValue?.key);
              }}
              error={exchangeTableValidation.touched.type && Boolean(exchangeTableValidation.errors.currencyId)}
              helperText={exchangeTableValidation.touched.type && exchangeTableValidation.errors.currencyId}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='rcm'
              label={labels.rcm}
              valueField='recordId'
              displayField='name'
              store={rcmStore}
              value={rcmStore.filter(item => item.recordId === exchangeTableValidation.values.rcm)[0]}
              required
              onChange={(event, newValue) => {

                exchangeTableValidation && exchangeTableValidation.setFieldValue('type', newValue?.key);
              }}
              error={exchangeTableValidation.touched.rcm && Boolean(exchangeTableValidation.errors.rcm)}
              helperText={exchangeTableValidation.touched.rcm && exchangeTableValidation.errors.rcm}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='rateAgainst'
              label={labels.rateAgainst}
              valueField='recordId'
              displayField='name'
              store={rateAgainstStore}
              value={rateAgainstStore.filter(item => item.recordId === exchangeTableValidation.values.rcm)[0]}
              required
              onChange={(event, newValue) => {

                exchangeTableValidation && exchangeTableValidation.setFieldValue('type', newValue?.key);
              }}
              error={exchangeTableValidation.touched.rcm && Boolean(exchangeTableValidation.errors.rcm)}
              helperText={exchangeTableValidation.touched.rcm && exchangeTableValidation.errors.rcm}
            />
          </Grid>



          </Grid>
    )
}

export default ExchangeTableTab
