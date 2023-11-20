// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

const CorrespondentTab = ({ labels, correspondentValidation, editMode, maxAccess }) => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <CustomTextField
          name='reference'
          label={labels.reference}
          value={correspondentValidation.values.reference}
          required
          onChange={correspondentValidation.handleChange}
          maxLength='10'
          maxAccess={maxAccess}
          onClear={() => correspondentValidation.setFieldValue('reference', '')}
          error={correspondentValidation.touched.reference && Boolean(correspondentValidation.errors.reference)}
          helperText={correspondentValidation.touched.reference && correspondentValidation.errors.reference}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name='name'
          label={labels.name}
          value={correspondentValidation.values.name}
          required
          maxLength='50'
          maxAccess={maxAccess}
          onChange={correspondentValidation.handleChange}
          onClear={() => correspondentValidation.setFieldValue('name', '')}
          error={correspondentValidation.touched.name && Boolean(correspondentValidation.errors.name)}
          helperText={correspondentValidation.touched.name && correspondentValidation.errors.name}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name='path'
          label={labels.path}
          value={correspondentValidation.values.path}
          required
          maxLength='100'
          maxAccess={maxAccess}
          onChange={correspondentValidation.handleChange}
          onClear={() => correspondentValidation.setFieldValue('path', '')}
          error={correspondentValidation.touched.path && Boolean(correspondentValidation.errors.path)}
          helperText={correspondentValidation.touched.path && correspondentValidation.errors.path}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              name='tt'
              checked={correspondentValidation.values?.tt}
              onChange={correspondentValidation.handleChange}
            />
          }
          label={labels.tt}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              name='inwards'
              checked={correspondentValidation.values?.inwards}
              onChange={correspondentValidation.inwards}
            />
          }
          label={labels.inwards}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              name='isInactive'
              checked={correspondentValidation.values?.isInactive}
              onChange={correspondentValidation.isInactive}
            />
          }
          label={labels.isInactive}
        />
      </Grid>
    </Grid>
  )
}

export default CorrespondentTab
