// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import Table from 'src/components/Shared/Table'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'


const ProductDispersalWindow = ({
  onClose,
  onSave,
  productDispersalValidation,
  dispersalTypeStore,
  maxAccess
}) => {
  return (
    <Window id='ProductDispersalWindow' Title='Dispersal' onClose={onClose} onSave={onSave} width={600} height={400}>
      <CustomTabPanel index={0} value={0}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          <Grid container gap={2}>
            <Grid container xs={12} spacing={2}>
              <Grid item xs={12}>
                <CustomTextField
                  name='reference'
                  label='Reference'
                  value={productDispersalValidation.values.reference}
                  required
                  readOnly={false}
                  onChange={productDispersalValidation.handleChange}
                  onClear={() => productDispersalValidation.setFieldValue('reference', '')}
                  error={Boolean(productDispersalValidation.errors.reference)}
                  helperText={productDispersalValidation.errors.reference}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='name'
                  label='Name'
                  value={productDispersalValidation.values.name}
                  required
                  readOnly={false}
                  onChange={productDispersalValidation.handleChange}
                  onClear={() => productDispersalValidation.setFieldValue('name', '')}
                  error={Boolean(productDispersalValidation.errors.name)}
                  helperText={productDispersalValidation.errors.name}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomComboBox
                  name='dispersalType'
                  label='dispersalType'
                  valueField='key'
                  displayField='value'
                  store={dispersalTypeStore}
                  value={dispersalTypeStore.filter(item => item.key === productDispersalValidation.values.dispersalType)[0]}
                  required
                  onChange={(event, newValue) => {
                    productDispersalValidation.setFieldValue('dispersalType', newValue?.key)
                  }}
                  error={Boolean(productDispersalValidation.errors.dispersalType)}
                  helperText={productDispersalValidation.errors.dispersalType}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name='isDefault'
                      required
                      checked={productDispersalValidation.values?.isDefault}
                      onChange={productDispersalValidation.handleChange}
                    />
                  }
                  label='Is Default'
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name='isInactive'
                      required
                      checked={productDispersalValidation.values?.isInactive}
                      onChange={productDispersalValidation.handleChange}
                    />
                  }
                  label='Is inactive'
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </CustomTabPanel>
    </Window>
  )
}

export default ProductDispersalWindow
