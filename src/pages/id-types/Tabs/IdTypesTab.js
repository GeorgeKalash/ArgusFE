// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

// ** Helpers

const IdTypesTab = ({ labels, idTypesValidation, maxAccess }) => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <CustomTextField
          name='name'
          label={labels.name}
          value={idTypesValidation.values.name}
          required
          maxLength='50'
          maxAccess={maxAccess}
          onChange={idTypesValidation.handleChange}
          onClear={() => idTypesValidation.setFieldValue('name', '')}
          error={idTypesValidation.touched.name && Boolean(idTypesValidation.errors.name)}
          helperText={idTypesValidation.touched.name && idTypesValidation.errors.name}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name='format'
          label={labels.format}
          value={idTypesValidation.values.format}
          required
          maxLength='10'
          maxAccess={maxAccess}
          onChange={idTypesValidation.handleChange}
          onClear={() => idTypesValidation.setFieldValue('format', '')}
          error={idTypesValidation.touched.format && Boolean(idTypesValidation.errors.format)}
          helperText={idTypesValidation.touched.format && idTypesValidation.errors.format}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name='length'
          label={labels.length}
          value={idTypesValidation.values.length}
          required
          minLength='1'
          maxLength='10'
          maxAccess={maxAccess}
          onChange={idTypesValidation.handleChange}
          onClear={() => idTypesValidation.setFieldValue('length', '')}
          error={idTypesValidation.touched.length && Boolean(idTypesValidation.errors.length)}
          helperText={idTypesValidation.touched.length && idTypesValidation.errors.length}
        />
      </Grid>
    </Grid>
  )
}

export default IdTypesTab
