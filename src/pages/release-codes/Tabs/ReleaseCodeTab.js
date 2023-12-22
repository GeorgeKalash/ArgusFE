// ** MUI Imports
import { Grid } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

const ReleaseCodeTab = ({ releaseCodeValidation, _labels, maxAccess, editMode }) => {
  return (
    <>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={_labels.reference}
            value={releaseCodeValidation.values.reference}
            readOnly={editMode}
            required
            onChange={releaseCodeValidation.handleChange}
            onClear={() => releaseCodeValidation.setFieldValue('reference', '')}
            error={releaseCodeValidation.touched.reference && Boolean(releaseCodeValidation.errors.reference)}
            helperText={releaseCodeValidation.touched.reference && releaseCodeValidation.errors.reference}
            maxLength='10'
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={_labels.name}
            value={releaseCodeValidation.values.name}
            required
            onChange={releaseCodeValidation.handleChange}
            onClear={() => releaseCodeValidation.setFieldValue('name', '')}
            error={releaseCodeValidation.touched.name && Boolean(releaseCodeValidation.errors.name)}
            helperText={releaseCodeValidation.touched.name && releaseCodeValidation.errors.name}
            maxLength='30'
            maxAccess={maxAccess}
          />
        </Grid>      
      </Grid>
    </>
  )
}

export default ReleaseCodeTab
