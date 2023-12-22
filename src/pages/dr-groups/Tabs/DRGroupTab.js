// ** MUI Imports
import { Grid } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

const DRGroupTab = ({ drGroupValidation, _labels, maxAccess, editMode }) => {
  return (
    <>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={_labels.reference}
            value={drGroupValidation.values.reference}
            readOnly={editMode}
            required
            onChange={drGroupValidation.handleChange}
            onClear={() => drGroupValidation.setFieldValue('reference', '')}
            error={drGroupValidation.touched.reference && Boolean(drGroupValidation.errors.reference)}
            helperText={drGroupValidation.touched.reference && drGroupValidation.errors.reference}
            maxLength='10'
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={_labels.name}
            value={drGroupValidation.values.name}
            required
            onChange={drGroupValidation.handleChange}
            onClear={() => drGroupValidation.setFieldValue('name', '')}
            error={drGroupValidation.touched.name && Boolean(drGroupValidation.errors.name)}
            helperText={drGroupValidation.touched.name && drGroupValidation.errors.name}
            maxLength='40'
            maxAccess={maxAccess}
          />
        </Grid>      
      </Grid>
    </>
  )
}

export default DRGroupTab
