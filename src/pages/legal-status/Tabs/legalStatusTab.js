// ** MUI Imports
import { Grid } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'


const LegalStatusTab = ({ legalStatusValidation, _labels }) => {
    return (
        <>
            <Grid container spacing={4}>
              <Grid item xs={12}>
                <CustomTextField
                  name='reference'
                  label={_labels.reference}
                  value={legalStatusValidation.values.reference}
                  required
                  onChange={legalStatusValidation.handleChange}
                  onClear={() => legalStatusValidation.setFieldValue('reference', '')}
                  error={legalStatusValidation.touched.reference && Boolean(legalStatusValidation.errors.reference)}
                  helperText={legalStatusValidation.touched.reference && legalStatusValidation.errors.reference}
                  maxLength='70'
                />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField
                  name='name'
                  label={_labels.name}
                  value={legalStatusValidation.values.name}
                  required
                  onChange={legalStatusValidation.handleChange}
                  onClear={() => legalStatusValidation.setFieldValue('name', '')}
                  error={legalStatusValidation.touched.name && Boolean(legalStatusValidation.errors.name)}
                  helperText={legalStatusValidation.touched.name && legalStatusValidation.errors.name}
                  maxLength='70'
                />
              </Grid>
            </Grid>
        </>
    )
}

export default LegalStatusTab