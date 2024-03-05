// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomTextField from 'src/components/Inputs/CustomTextField'

const sourceOfIncomeForm = ({ labels, sourceOfIncomeValidation, incomeTypeStore, maxAccess }) => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <CustomTextField
          name='reference'
          label={labels.reference}
          value={sourceOfIncomeValidation.values.reference}
          required
          onChange={sourceOfIncomeValidation.handleChange}
          maxLength='10'
          maxAccess={maxAccess}
          onClear={() => sourceOfIncomeValidation.setFieldValue('reference', '')}
          error={sourceOfIncomeValidation.touched.reference && Boolean(sourceOfIncomeValidation.errors.reference)}
          helperText={sourceOfIncomeValidation.touched.reference && sourceOfIncomeValidation.errors.reference}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name='name'
          label={labels.name}
          value={sourceOfIncomeValidation.values.name}
          required
          maxLength='50'
          maxAccess={maxAccess}
          onChange={sourceOfIncomeValidation.handleChange}
          onClear={() => sourceOfIncomeValidation.setFieldValue('name', '')}
          error={sourceOfIncomeValidation.touched.name && Boolean(sourceOfIncomeValidation.errors.name)}
          helperText={sourceOfIncomeValidation.touched.name && sourceOfIncomeValidation.errors.name}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name='flName'
          label={labels.foreignLanguage}
          value={sourceOfIncomeValidation.values.flName}
          required
          maxLength='50'
          maxAccess={maxAccess}
          onChange={sourceOfIncomeValidation.handleChange}
          onClear={() => sourceOfIncomeValidation.setFieldValue('flName', '')}
          error={sourceOfIncomeValidation.touched.flName && Boolean(sourceOfIncomeValidation.errors.flName)}
          helperText={sourceOfIncomeValidation.touched.flName && sourceOfIncomeValidation.errors.flName}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomComboBox
          name='incomeType'
          label={labels.incomeType}
          valueField='key'
          displayField='value'
          store={incomeTypeStore}
          value={incomeTypeStore.filter(item => item.key === sourceOfIncomeValidation.values.incomeType?.toString())[0]}
          required
          maxAccess={maxAccess}
          onChange={(event, newValue) => {
            sourceOfIncomeValidation.setFieldValue('incomeType', newValue?.key)
          }}
          error={sourceOfIncomeValidation.touched.incomeType && Boolean(sourceOfIncomeValidation.errors.incomeType)}
          helperText={sourceOfIncomeValidation.touched.incomeType && sourceOfIncomeValidation.errors.incomeType}
        />
      </Grid>
    </Grid>
  )
}

export default sourceOfIncomeForm
