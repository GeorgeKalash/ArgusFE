import { useState } from 'react'

// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import { getFormattedNumberMax} from 'src/lib/numberField-helper'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

const OutwardsTab=({
    labels,
    outwardsValidation,
    countryStore,
    onCountrySelection,
    dispersalTypeStore,
    onDispersalSelection,
    currencyStore,
    onCurrencySelection,
    agentsStore,
    onAmountDataFill,
    editMode,
    maxAccess
}) =>{

  const [position, setPosition] = useState()


    return (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <CustomComboBox
              name='countryId'
              label='Country'
              valueField='countryId'
              displayField='countryRef'
              store={countryStore}
              value={countryStore.filter(item => item.countryId === outwardsValidation.values.countryId)[0]}
              onChange={(event, newValue) => {
                outwardsValidation.setFieldValue('countryId', newValue?.countryId)
                onCountrySelection(newValue?.countryId);
              }}
              error={Boolean(outwardsValidation.errors.countryId)}
              helperText={outwardsValidation.errors.countryId}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='dispersalType'
              label='dispersal type'
              valueField='dispersalType'
              displayField='dispersalTypeName'
              store={dispersalTypeStore}
              value={dispersalTypeStore?.filter(item => item.dispersalType === outwardsValidation.values.dispersalType)[0]}
              onChange={(event, newValue) => {
                outwardsValidation.setFieldValue('dispersalType', newValue?.dispersalType)
                onDispersalSelection(outwardsValidation.values.countryId, newValue?.dispersalType);
              }}
              error={Boolean(outwardsValidation.errors.dispersalType)}
              helperText={outwardsValidation.errors.dispersalType}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='currencyId'
              label='Currency'
              valueField='currencyId'
              displayField='currencyRef'
              store={currencyStore}
              value={currencyStore?.filter(item => item.currencyId === outwardsValidation.values.currencyId)[0]}
              onChange={(event, newValue) => {
                outwardsValidation.setFieldValue('currencyId', newValue?.currencyId)
                onCurrencySelection(outwardsValidation.values.countryId, outwardsValidation.values.dispersalType, newValue?.currencyId)
              }}
              error={Boolean(outwardsValidation.errors.currencyId)}
              helperText={outwardsValidation.errors.currencyId}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='agentId'
              label='Agent'
              valueField='agentId'
              displayField='agentName'
              store={agentsStore}
              value={agentsStore?.filter(item => item.agentId === outwardsValidation.values.agentId)[0]}
              onChange={(event, newValue) => {
                outwardsValidation.setFieldValue('agentId', newValue?.agentId)
              }}
              error={Boolean(outwardsValidation.errors.agentId)}
              helperText={outwardsValidation.errors.agentId}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              position={position}
              name='amount'
              type="text"
              label="amount"
              value={outwardsValidation.values.amount}
              required
              maxAccess={maxAccess}
              onChange={e => {
                const input = e.target;
                const formattedValue = input.value  ? getFormattedNumberMax(input.value, 8, 2) : input.value ;

                // Save current cursor position
                const currentPosition = input.selectionStart;

                // Update field value
                outwardsValidation.setFieldValue('amount', formattedValue);

                // Calculate the new cursor position based on the formatted value
                const newCursorPosition =
                  currentPosition +
                  (formattedValue && formattedValue.length - input.value.length);

                setPosition(newCursorPosition);

              }}
              onBlur={() => {
                onAmountDataFill(outwardsValidation.values);
              }}
              onClear={() => outwardsValidation.setFieldValue('amount', '')}
              error={outwardsValidation.touched.amount && Boolean(outwardsValidation.errors.amount)}
              helperText={outwardsValidation.touched.amount && outwardsValidation.errors.amount}
            />
          </Grid>
          
        </Grid>
    )
}

export default OutwardsTab