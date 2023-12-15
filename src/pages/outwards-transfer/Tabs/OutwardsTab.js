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
    plantStore,
    countryStore,
    onCountrySelection,
    dispersalTypeStore,
    onDispersalSelection,
    currencyStore,
    onCurrencySelection,
    agentsStore,
    productsStore,
    onAmountDataFill,
    editMode,
    maxAccess
}) =>{

  const [position, setPosition] = useState()


    return (
      <Grid container>
        {/* First Column */}
          <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
            <Grid item xs={12}>
            <CustomComboBox
                name='plantId'
                label='Plant'
                valueField='recordId'
                displayField='name'
                store={plantStore}
                required
                value={plantStore.filter(item => item.recordId === outwardsValidation.values.plantId)[0]}
                onChange={(event, newValue) => {
                  outwardsValidation.setFieldValue('plantId', newValue?.recordId)
                }}
                error={outwardsValidation.touched.plantId && Boolean(outwardsValidation.errors.plantId)}
                helperText={outwardsValidation.touched.plantId && outwardsValidation.errors.plantId}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomComboBox
                name='countryId'
                label='Country'
                valueField='countryId'
                displayField='countryRef'
                store={countryStore}
                required
                value={countryStore.filter(item => item.countryId === outwardsValidation.values.countryId)[0]}
                onChange={(event, newValue) => {
                  outwardsValidation.setFieldValue('countryId', newValue?.countryId)
                  onCountrySelection(newValue?.countryId);
                }}
                error={outwardsValidation.touched.countryId && Boolean(outwardsValidation.errors.countryId)}
                helperText={outwardsValidation.touched.countryId && outwardsValidation.errors.countryId}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomComboBox
                name='dispersalType'
                label='dispersal type'
                valueField='dispersalType'
                displayField='dispersalTypeName'
                required
                store={dispersalTypeStore}
                value={dispersalTypeStore?.filter(item => item.dispersalType === outwardsValidation.values.dispersalType)[0]}
                onChange={(event, newValue) => {
                  outwardsValidation.setFieldValue('dispersalType', newValue?.dispersalType)
                  onDispersalSelection(outwardsValidation.values.countryId, newValue?.dispersalType);
                }}
                error={outwardsValidation.touched.dispersalType && Boolean(outwardsValidation.errors.dispersalType)}
                helperText={outwardsValidation.touched.dispersalType && outwardsValidation.errors.dispersalType}
              />
            </Grid>
            <Grid item xs={12}>
              <CustomComboBox
                name='currencyId'
                label='Currency'
                valueField='currencyId'
                displayField='currencyRef'
                required
                store={currencyStore}
                value={currencyStore?.filter(item => item.currencyId === outwardsValidation.values.currencyId)[0]}
                onChange={(event, newValue) => {
                  outwardsValidation.setFieldValue('currencyId', newValue?.currencyId)
                  onCurrencySelection(outwardsValidation.values.countryId, outwardsValidation.values.dispersalType, newValue?.currencyId)
                }}
                error={outwardsValidation.touched.currencyId && Boolean(outwardsValidation.errors.currencyId)}
                helperText={outwardsValidation.touched.currencyId && outwardsValidation.errors.currencyId}
              />
            </Grid>
          </Grid>
          {/* Second Column */}
          <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
            
            <Grid item xs={12}>
              <CustomComboBox
                name='agentId'
                label='Agent'
                valueField='agentId'
                displayField='agentName'
                required
                store={agentsStore}
                value={agentsStore?.filter(item => item.agentId === outwardsValidation.values.agentId)[0]}
                onChange={(event, newValue) => {
                  outwardsValidation.setFieldValue('agentId', newValue?.agentId)
                }}
                error={outwardsValidation.touched.agentId && Boolean(outwardsValidation.errors.agentId)}
                helperText={outwardsValidation.touched.agentId && outwardsValidation.errors.agentId}
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
                console.log(outwardsValidation.values);
                onAmountDataFill(outwardsValidation.values);
              }}
              onClear={() => outwardsValidation.setFieldValue('amount', '')}
              error={outwardsValidation.touched.amount && Boolean(outwardsValidation.errors.amount)}
              helperText={outwardsValidation.touched.amount && outwardsValidation.errors.amount}
            />
            </Grid>
            <Grid item xs={12}>
            <CustomComboBox
              name='productId'
              label='Product'
              valueField='productId'
              displayField='productName'
              required
              store={productsStore}
              value={productsStore?.filter(item => item.productId === outwardsValidation.values.productId)[0]}
              onChange={(event, newValue) => {
                outwardsValidation.setFieldValue('productId', newValue?.productId)
                outwardsValidation.setFieldValue('fees', newValue?.fees)
              }}
              error={outwardsValidation.touched.productId && Boolean(outwardsValidation.errors.productId)}
              helperText={outwardsValidation.touched.productId && outwardsValidation.errors.productId}
            />
            </Grid>
            <Grid item xs={12}>
            <CustomTextField
              position={position}
              name='fees'
              type="text"
              label="fees"
              value={outwardsValidation.values.fees}
              required
              maxAccess={maxAccess}
              onChange={e => {
                const input = e.target;
                const formattedValue = input.value  ? getFormattedNumberMax(input.value, 8, 2) : input.value ;

                // Save current cursor position
                const currentPosition = input.selectionStart;

                // Calculate the new cursor position based on the formatted value
                const newCursorPosition =
                  currentPosition +
                  (formattedValue && formattedValue.length - input.value.length);

                setPosition(newCursorPosition);

              }}
              error={outwardsValidation.touched.fees && Boolean(outwardsValidation.errors.fees)}
              helperText={outwardsValidation.touched.fees && outwardsValidation.errors.fees}
            />
          </Grid>
        </Grid>
      </Grid>
    )
}

export default OutwardsTab