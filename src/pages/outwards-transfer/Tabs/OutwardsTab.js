import { useState } from 'react'

// ** MUI Imports
import { Grid, FormControlLabel, Checkbox, Button } from '@mui/material'
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
    setProductsWindowOpen,
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
                displayField={['reference','name']}
                store={plantStore}
                required
                columnsInDropDown= {[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' }
                ]}
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
                displayField={['countryRef','countryName']}
                columnsInDropDown= {[
                  { key: 'countryRef', value: 'Reference' },
                  { key: 'countryName', value: 'Name' },
                ]}
                store={countryStore}
                required
                value={countryStore.filter(item => item.countryId === outwardsValidation.values.countryId)[0]}
                onChange={(event, newValue) => {
                  outwardsValidation.setFieldValue('countryId', newValue?.countryId)
                  if(newValue)
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
                readOnly={outwardsValidation.values.countryId != null ? false : true}
                store={dispersalTypeStore}
                value={dispersalTypeStore?.filter(item => item.dispersalType === outwardsValidation.values.dispersalType)[0]}
                onChange={(event, newValue) => {
                  outwardsValidation.setFieldValue('dispersalType', newValue?.dispersalType)
                  if(newValue)
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
                displayField={['currencyRef','currencyName']}
                columnsInDropDown= {[
                  { key: 'currencyRef', value: 'Reference' },
                  { key: 'currencyName', value: 'Name' },
                ]}
                required
                readOnly={outwardsValidation.values.dispersalType != null ? false : true}
                store={currencyStore}
                value={currencyStore?.filter(item => item.currencyId === outwardsValidation.values.currencyId)[0]}
                onChange={(event, newValue) => {
                  outwardsValidation.setFieldValue('currencyId', newValue?.currencyId)
                  if(newValue)
                    onCurrencySelection(outwardsValidation.values.countryId, outwardsValidation.values.dispersalType, newValue?.currencyId)
                }}
                error={outwardsValidation.touched.currencyId && Boolean(outwardsValidation.errors.currencyId)}
                helperText={outwardsValidation.touched.currencyId && outwardsValidation.errors.currencyId}
              />
            </Grid>

            <Grid item xs={12}>
              <CustomComboBox
                name='agentId'
                label='Agent'
                valueField='agentId'
                displayField='agentName'
                required = {outwardsValidation.values.dispersalType === 2 ? true : false}
                readOnly={outwardsValidation.values.dispersalType != null && outwardsValidation.values.dispersalType === 2 ? false : true}
                store={agentsStore}
                value={agentsStore?.filter(item => item.agentId === outwardsValidation.values.agentId)[0]}
                onChange={(event, newValue) => {
                  outwardsValidation.setFieldValue('agentId', newValue?.agentId)
                }}
                error={outwardsValidation.touched.agentId && Boolean(outwardsValidation.errors.agentId)}
                helperText={outwardsValidation.touched.agentId && outwardsValidation.errors.agentId}
              />
            </Grid>
          </Grid>
          {/* Second Column */}
          <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
            <Grid item xs={12}>
            <CustomTextField
              position={position}
              name='amount'
              type="text"
              label="amount"
              value={outwardsValidation.values.amount}
              required
              readOnly={(outwardsValidation.values.dispersalType == 2 && outwardsValidation.values.agentId != null) || (outwardsValidation.values.dispersalType == 1 && outwardsValidation.values.agentId === null)? false : true}
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
                if(outwardsValidation.values.amount)
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
              readOnly={true}
              store={productsStore}
              value={productsStore?.filter(item => item.productId === outwardsValidation.values.productId)[0]}

              // onChange={(event, newValue) => {
              //   outwardsValidation.setFieldValue('productId', newValue?.productId)
              //   outwardsValidation.setFieldValue('fees', newValue?.fees)
              //   outwardsValidation.setFieldValue('baseAmount', newValue?.baseAmount)
              //   outwardsValidation.setFieldValue('net', newValue?.fees + newValue?.baseAmount)
              // }}
              error={outwardsValidation.touched.productId && Boolean(outwardsValidation.errors.productId)}
              helperText={outwardsValidation.touched.productId && outwardsValidation.errors.productId}
            />
            <Button onClick={() => setProductsWindowOpen(true)}>Open Popup</Button>
            </Grid>
            <Grid item xs={12}>
            <CustomTextField
              position={position}
              name='fees'
              type="text"
              label="fees"
              value={outwardsValidation.values.fees}
              required
              readOnly
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
          <Grid item xs={12}>
          <CustomTextField
              position={position}
              name='baseAmount'
              type="text"
              label="Base Amount"
              value={outwardsValidation.values.baseAmount}
              required
              readOnly
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
              error={outwardsValidation.touched.baseAmount && Boolean(outwardsValidation.errors.baseAmount)}
              helperText={outwardsValidation.touched.baseAmount && outwardsValidation.errors.baseAmount}
            />
          </Grid>
          <Grid item xs={12}>
          <CustomTextField
              position={position}
              name='net'
              type="text"
              label="net to pay"
              value={outwardsValidation.values.net}
              required
              readOnly
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
              error={outwardsValidation.touched.net && Boolean(outwardsValidation.errors.net)}
              helperText={outwardsValidation.touched.net && outwardsValidation.errors.net}
            />
          </Grid>
        </Grid>
      </Grid>
    )
}

export default OutwardsTab
