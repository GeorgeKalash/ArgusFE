// ** MUI Imports
import { Grid } from '@mui/material'

// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CustomTextField from 'src/components/Inputs/CustomTextField'


const LegalStatusWindow = ({
    onClose,
    onSave,
    legalStatusValidation,
    width,
    height
}) => {
    return (
        <Window id='LegalStatusWindow' Title='Legal Status' onClose={onClose} width={width} height={height} onSave={onSave}>
           <CustomTabPanel>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <CustomTextField
                  name='reference'
                  label='Reference'
                  value={legalStatusValidation.values.reference}
                  required
                  onChange={legalStatusValidation.handleChange}
                  onClear={() => legalStatusValidation.setFieldValue('reference', '')}
                  error={legalStatusValidation.touched.reference && Boolean(legalStatusValidation.errors.reference)}
                  helperText={legalStatusValidation.touched.reference && legalStatusValidation.errors.reference}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='name'
                  label='Name'
                  value={legalStatusValidation.values.name}
                  required
                  onChange={legalStatusValidation.handleChange}
                  onClear={() => legalStatusValidation.setFieldValue('name', '')}
                  error={legalStatusValidation.touched.name && Boolean(legalStatusValidation.errors.name)}
                  helperText={legalStatusValidation.touched.name && legalStatusValidation.errors.name}
                />
              </Grid>
            </Grid>
          </CustomTabPanel>
        </Window>
    )
}


export default LegalStatusWindow
