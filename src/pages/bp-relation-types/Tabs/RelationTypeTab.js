// ** MUI Imports
import { Grid } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

const RelationTypeTab=({
    labels,
    RelationTypeValidation,
    maxAccess
}) =>{



    return (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <CustomTextField
              name='reference'
              label={labels.reference}
              value={RelationTypeValidation.values.reference}
              required
              onChange={RelationTypeValidation.handleChange}
              maxLength = '10'
              maxAccess={maxAccess}
              onClear={() => RelationTypeValidation.setFieldValue('reference', '')}
              error={RelationTypeValidation.touched.reference && Boolean(RelationTypeValidation.errors.reference)}
              helperText={RelationTypeValidation.touched.reference && RelationTypeValidation.errors.reference}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={RelationTypeValidation.values.name}
              required
              maxLength = '50'
              maxAccess={maxAccess}
              onChange={RelationTypeValidation.handleChange}
              onClear={() => RelationTypeValidation.setFieldValue('name', '')}
              error={RelationTypeValidation.touched.name && Boolean(RelationTypeValidation.errors.name)}
              helperText={RelationTypeValidation.touched.name && RelationTypeValidation.errors.name}
            />
          </Grid>


          </Grid>
    )
}

export default RelationTypeTab
