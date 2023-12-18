// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'


// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

const IdCategoryTab=({
    labels,
    IdCategoryValidation,
    maxAccess
}) =>{

    return (
        <Grid container spacing={4}>

          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={IdCategoryValidation.values.name}
              required
              maxLength = '50'
              maxAccess={maxAccess}
              onChange={IdCategoryValidation.handleChange}
              onClear={() => IdCategoryValidation.setFieldValue('name', '')}
              error={IdCategoryValidation.touched.name && Boolean(IdCategoryValidation.errors.name)}
              helperText={IdCategoryValidation.touched.name && IdCategoryValidation.errors.name}
            />
          </Grid>

          <Grid item xs={12}>
          <FormControlLabel
           control={
            <Checkbox
              name="org"
              checked={IdCategoryValidation.values?.org}
              onChange={IdCategoryValidation.handleChange}
              maxAccess={maxAccess}
            />
          }
          label={labels.org}
        />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
            name="person"
            checked={IdCategoryValidation.values?.person}
              onChange={IdCategoryValidation.handleChange}
              maxAccess={maxAccess}
            />
          }
          label={labels.person}
        />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
            name='group'
            checked={IdCategoryValidation.values?.group}
            onChange={IdCategoryValidation.handleChange}
            maxAccess={maxAccess}
            />
          }
          label={labels.group}
          />
      </Grid>

      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              name="isUnique"
              checked={IdCategoryValidation.values?.isUnique}
              onChange={IdCategoryValidation.handleChange}
              maxAccess={maxAccess}
            />
          }
          label={labels.unique}
          />
      </Grid>
     </Grid>
    )
}

export default IdCategoryTab
