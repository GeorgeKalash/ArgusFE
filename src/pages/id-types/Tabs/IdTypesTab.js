// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

// ** Helpers
import { getFormattedNumberMax } from 'src/lib/numberField-helper'

const IdTypesTab = ({ labels, idTypesValidation, maxAccess, categoryStore }) => {
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

      <Grid item xs={12}>
        <CustomComboBox
          name='category'
          label={labels.category}
          valueField='key'
          displayField='value'
          store={categoryStore}
          value={categoryStore.filter(item => item.key === idTypesValidation.values.category)[0]}
          required
          maxAccess={maxAccess}
          onChange={(event, newValue) => {
            idTypesValidation && idTypesValidation.setFieldValue('category', newValue?.key)
          }}
          error={idTypesValidation.touched.category && Boolean(idTypesValidation.errors.category)}
          helperText={idTypesValidation.touched.category && idTypesValidation.errors.category}
        />
      </Grid>
    </Grid>
  )
}

export default IdTypesTab
