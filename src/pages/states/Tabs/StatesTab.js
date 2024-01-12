// ** MUI Imports
import { Grid } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

const StatesTab = ({ labels, statesValidation , countryStore, maxAccess }) => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <CustomTextField
          name='name'
          maxLength='30'
          label={labels.name}
          value={statesValidation.values.name}
          required
          maxAccess={maxAccess}
          onChange={statesValidation.handleChange}
          onClear={() => statesValidation.setFieldValue('name', '')}
          error={statesValidation.touched.name && Boolean(statesValidation.errors.name)}
          helperText={statesValidation.touched.name && statesValidation.errors.name}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomComboBox
          name='countryId'
          label={labels.country}
          valueField='recordId'
          displayField='name'
          columnsInDropDown= {[
            { key: 'reference', value: 'Reference' },
            { key: 'name', value: 'Name' }
          ]}
          store={countryStore}
          value={countryStore.filter(item => item.recordId === statesValidation.values.countryId)[0]} // Ensure the value matches an option or set it to null
          required
          maxAccess={maxAccess}
          onChange={(event, newValue) => {statesValidation.setFieldValue('countryId', newValue?.recordId)}}
          error={statesValidation.touched.countryId && Boolean(statesValidation.errors.countryId)}
          helperText={statesValidation.touched.countryId && statesValidation.errors.countryId}
        />
      </Grid>
    </Grid>
  )
}

export default StatesTab
