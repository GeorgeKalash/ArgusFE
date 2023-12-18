// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

const GeographicRegionsTab = ({ labels, geographicRegionsValidation, editMode, maxAccess }) => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <CustomTextField
          name='reference'
          label={labels.reference}
          value={geographicRegionsValidation.values.reference}
          required
          maxAccess={maxAccess}
          readOnly={editMode}
          onChange={geographicRegionsValidation.handleChange}
          onClear={() => geographicRegionsValidation.setFieldValue('reference', '')}
          error={geographicRegionsValidation.touched.reference && Boolean(geographicRegionsValidation.errors.reference)}
          helperText={geographicRegionsValidation.touched.reference && geographicRegionsValidation.errors.reference}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name='name'
          label={labels.name}
          value={geographicRegionsValidation.values.name}
          required
          maxAccess={maxAccess}
          onChange={geographicRegionsValidation.handleChange}
          onClear={() => geographicRegionsValidation.setFieldValue('name', '')}
          error={geographicRegionsValidation.touched.name && Boolean(geographicRegionsValidation.errors.name)}
          helperText={geographicRegionsValidation.touched.name && geographicRegionsValidation.errors.name}
        />
      </Grid>
    </Grid>
  )
}

export default GeographicRegionsTab
