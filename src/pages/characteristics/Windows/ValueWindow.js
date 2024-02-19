// ** MUI Imports
import { Grid, Box } from '@mui/material'

// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CustomTextField from 'src/components/Inputs/CustomTextField'

const ValueWindow = ({ onClose, onSave, valueValidation, _labels, maxAccess, editMode }) => {
  return (
    <Window id='ValueWindow' Title={_labels.value} onClose={onClose} onSave={onSave} width={500} height={300}>
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
                  name='value'
                  label={_labels.value}
                  value={valueValidation.values.value}
                  required
                  onChange={valueValidation.handleChange}
                  onClear={() => valueValidation.setFieldValue('value', '')}
                  error={valueValidation.touched.value && Boolean(valueValidation.errors.value)}
                  helperText={valueValidation.touched.value && valueValidation.errors.value}
                  maxAccess={maxAccess}
                />
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </CustomTabPanel>
    </Window>
  )
}

export default ValueWindow
