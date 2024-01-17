// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomTextField from 'src/components/Inputs/CustomTextField'

const CommissionTypeTab=({
    labels,
    commissiontypeValidation,
    typeStore,
    editMode,
    maxAccess
}) =>{
    return (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <CustomTextField
              name='reference'
              label={labels.reference}
              value={commissiontypeValidation.values.reference}
              required
              onChange={commissiontypeValidation.handleChange}
              maxLength = '3'
              maxAccess={maxAccess}
              onClear={() => commissiontypeValidation.setFieldValue('reference', '')}
              error={commissiontypeValidation.touched.reference && Boolean(commissiontypeValidation.errors.reference)}
              helperText={commissiontypeValidation.touched.reference && commissiontypeValidation.errors.reference}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={commissiontypeValidation.values.name}
              required
              maxLength = '30'
              maxAccess={maxAccess}
              onChange={commissiontypeValidation.handleChange}
              onClear={() => commissiontypeValidation.setFieldValue('name', '')}
              error={commissiontypeValidation.touched.name && Boolean(commissiontypeValidation.errors.name)}
              helperText={commissiontypeValidation.touched.name && commissiontypeValidation.errors.name}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='type'
              label={labels.type}
              valueField='key'
              displayField='value'
              store={typeStore}
              value={typeStore.filter(item => item.key === commissiontypeValidation.values.type?.toString())[0]}
              required
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                commissiontypeValidation.setFieldValue('type', newValue?.key)
              }}
              error={commissiontypeValidation.touched.type && Boolean(commissiontypeValidation.errors.type)}
              helperText={commissiontypeValidation.touched.type && commissiontypeValidation.errors.type}
            />
          </Grid>
          </Grid>
    )
}

export default CommissionTypeTab