// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

const InterfaceTab=({
    labels,
    interfaceValidation,
    editMode,
    maxAccess
}) =>{
    return (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <CustomTextField
              name='reference'
              label={labels.reference}
              value={interfaceValidation.values.reference}
              required
              onChange={interfaceValidation.handleChange}
              maxLength = '10'
              maxAccess={maxAccess}
              onClear={() => interfaceValidation.setFieldValue('reference', '')}
              error={interfaceValidation.touched.reference && Boolean(interfaceValidation.errors.reference)}
              helperText={interfaceValidation.touched.reference && interfaceValidation.errors.reference}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={interfaceValidation.values.name}
              required
              maxLength = '50'
              maxAccess={maxAccess}
              onChange={interfaceValidation.handleChange}
              onClear={() => interfaceValidation.setFieldValue('name', '')}
              error={interfaceValidation.touched.name && Boolean(interfaceValidation.errors.name)}
              helperText={interfaceValidation.touched.name && interfaceValidation.errors.name}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='path'
              label={labels.path}
              value={interfaceValidation.values.path}
              required
              maxLength = '100'
              maxAccess={maxAccess}
              onChange={interfaceValidation.handleChange}
              onClear={() => interfaceValidation.setFieldValue('path', '')}
              error={interfaceValidation.touched.path && Boolean(interfaceValidation.errors.path)}
              helperText={interfaceValidation.touched.path && interfaceValidation.errors.path}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='description'
              label={labels.description}
              value={interfaceValidation.values.description}
              required
              maxLength = '200'
              maxAccess={maxAccess}
              onChange={interfaceValidation.handleChange}
              onClear={() => interfaceValidation.setFieldValue('description', '')}
              error={interfaceValidation.touched.description && Boolean(interfaceValidation.errors.description)}
              helperText={interfaceValidation.touched.description && interfaceValidation.errors.description}
            />
          </Grid>
        </Grid>
    )
}

export default InterfaceTab