// ** MUI Imports
import { Grid } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

const RelationTypeTab=({
    labels,
    relationTypesValidation,
    maxAccess
}) =>{
    return (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <CustomTextField
              name='reference'
              label={labels.reference}
              value={relationTypesValidation.values.reference}
              required
              onChange={relationTypesValidation.handleChange}
              maxLength = '10'
              maxAccess={maxAccess}
              onClear={() => relationTypesValidation.setFieldValue('reference', '')}
              error={relationTypesValidation.touched.reference && Boolean(relationTypesValidation.errors.reference)}
              helperText={relationTypesValidation.touched.reference && relationTypesValidation.errors.reference}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={relationTypesValidation.values.name}
              required
              maxLength = '50'
              maxAccess={maxAccess}
              onChange={relationTypesValidation.handleChange}
              onClear={() => relationTypesValidation.setFieldValue('name', '')}
              error={relationTypesValidation.touched.name && Boolean(relationTypesValidation.errors.name)}
              helperText={relationTypesValidation.touched.name && relationTypesValidation.errors.name}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='flName'
              label={labels.flName}
              value={relationTypesValidation.values.flName}
              required
              maxLength = '50'
              maxAccess={maxAccess}
              onChange={relationTypesValidation.handleChange}
              onClear={() => relationTypesValidation.setFieldValue('flName', '')}
              error={relationTypesValidation.touched.flName && Boolean(relationTypesValidation.errors.flName)}
              helperText={relationTypesValidation.touched.flName && relationTypesValidation.errors.flName}
            />
          </Grid>
          </Grid>
    )
}

export default RelationTypeTab
