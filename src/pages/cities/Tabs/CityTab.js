
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomTextField from 'src/components/Inputs/CustomTextField'

const CityTab=({
    labels,
    cityValidation,
    countryStore,
    stateStore,
    fillStateStore,
    editMode
}) =>{
    return (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <CustomTextField
              name='reference'
              label={labels.reference}
              value={cityValidation.values.reference}
              required
              readOnly={editMode}
              onChange={cityValidation.handleChange}
              onClear={() => cityValidation.setFieldValue('reference', '')}
              error={cityValidation.touched.reference && Boolean(cityValidation.errors.reference)}
              helperText={cityValidation.touched.reference && cityValidation.errors.reference}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={cityValidation.values.name}
              required
              readOnly={editMode}
              onChange={cityValidation.handleChange}
              onClear={() => cityValidation.setFieldValue('name', '')}
              error={cityValidation.touched.name && Boolean(cityValidation.errors.name)}
              helperText={cityValidation.touched.name && cityValidation.errors.name}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='countryId'
              label={labels.country}
              valueField='recordId'
              displayField='name'
              store={countryStore}
              value={countryStore.filter(item => item.recordId === cityValidation.values.countryId)[0]}// Ensure the value matches an option or set it to null
              required 
              readOnly={editMode}
              onChange={(event, newValue) => {
                cityValidation.setFieldValue('countryId', newValue?.recordId)
                const selectedCountryId = newValue?.recordId || ''
                console.log('countryId '+ selectedCountryId)
                fillStateStore(selectedCountryId) // Fetch and update state data based on the selected country
              }}
              error={cityValidation.touched.countryId && Boolean(cityValidation.errors.countryId)}
              helperText={cityValidation.touched.countryId && cityValidation.errors.countryId}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='stateId'
              label={labels.state}
              valueField='recordId'
              displayField='name'
              store={stateStore}
              value={stateStore.filter(item => item.recordId === cityValidation.values.stateId)[0]}
              required
              readOnly={editMode && cityValidation.values.stateId !== null}
              onChange={(event, newValue) => {
                cityValidation.setFieldValue('stateId', newValue?.recordId)
              }}
              error={cityValidation.touched.stateId && Boolean(cityValidation.errors.stateId)}
              helperText={cityValidation.touched.stateId && cityValidation.errors.stateId}
            />
          </Grid>
        </Grid>
         )
        }
        
  export default CityTab