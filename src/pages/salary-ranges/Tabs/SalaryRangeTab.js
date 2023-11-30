// ** MUI Imports
import { Grid } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

const SalaryRangeTab=({
    labels,
    salaryRangeValidation,
    maxAccess
}) =>{
    return (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <CustomTextField
              name='min'
              label={labels.min}
              value={salaryRangeValidation.values.min}
              required
              maxLength = '10'
              maxAccess={maxAccess}
              onChange={salaryRangeValidation.handleChange}
              onClear={() => salaryRangeValidation.setFieldValue('min', '')}
              error={salaryRangeValidation.touched.min && Boolean(salaryRangeValidation.errors.min)}
              helperText={salaryRangeValidation.touched.min && salaryRangeValidation.errors.min}
            />
          </Grid>
          <Grid item xs={12}>
          <CustomTextField
              name='max'
              label={labels.max}
              value={salaryRangeValidation.values.max}
              required
              maxLength = '10'
              maxAccess={maxAccess}
              onChange={salaryRangeValidation.handleChange}
              onClear={() => salaryRangeValidation.setFieldValue('max', '')}
              error={salaryRangeValidation.touched.max && Boolean(salaryRangeValidation.errors.max)}
              helperText={salaryRangeValidation.touched.max && salaryRangeValidation.errors.max}
            />
          </Grid>

          </Grid>
    )
}

export default SalaryRangeTab
