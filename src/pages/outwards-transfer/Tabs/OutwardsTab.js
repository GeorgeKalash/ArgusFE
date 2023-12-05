// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

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
    editMode,
    maxAccess
}) =>{
    return (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <CustomComboBox
              name='countryId'
              label='Country'
              valueField='recordId'
              displayField='reference'
              store={countryStore}
              value={countryStore.filter(item => item.recordId === outwardsValidation.values.countryId)[0]}
              onChange={(event, newValue) => {
                outwardsValidation.setFieldValue('countryId', newValue?.recordId)
                onCountrySelection(newValue?.recordId);
              }}
              error={Boolean(outwardsValidation.errors.countryId)}
              helperText={outwardsValidation.errors.countryId}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='dispersalType'
              label='dispersal type'
              valueField='key'
              displayField='value'
              store={dispersalTypeStore}
              value={dispersalTypeStore?.filter(item => item.key === outwardsValidation.values.dispersalType)[0]}
              onChange={(event, newValue) => {
                outwardsValidation.setFieldValue('dispersalType', newValue?.key)
                onDispersalSelection(newValue?.key);
              }}
              error={Boolean(outwardsValidation.errors.dispersalType)}
              helperText={outwardsValidation.errors.dispersalType}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='currencyId'
              label='Currency'
              valueField='recordId'
              displayField='reference'
              store={currencyStore}
              value={currencyStore?.filter(item => item.recordId === outwardsValidation.values.currencyId)[0]}
              onChange={(event, newValue) => {
                outwardsValidation.setFieldValue('currencyId', newValue?.recordId)
              }}
              error={Boolean(outwardsValidation.errors.currencyId)}
              helperText={outwardsValidation.errors.currencyId}
            />
          </Grid>
          
        </Grid>
    )
}

export default OutwardsTab