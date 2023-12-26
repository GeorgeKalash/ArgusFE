// ** MUI Imports
import { Grid } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'

const smsTemplatesTab = ({ labels, smsTemplatesValidation, maxAccess }) => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <CustomTextField
          name='name'
          label={labels.name}
          value={smsTemplatesValidation.values.name}
          required
          maxAccess={maxAccess}
          maxLength='30'
          onChange={smsTemplatesValidation.handleChange}
          onClear={() => smsTemplatesValidation.setFieldValue('name', '')}
          error={smsTemplatesValidation.touched.name && Boolean(smsTemplatesValidation.errors.name)}
          helperText={smsTemplatesValidation.touched.name && smsTemplatesValidation.errors.name}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextArea
          name='smsBody'
          label={labels.smsBody}
          value={smsTemplatesValidation.values.smsBody}
          required
          rows={2}
          maxAccess={maxAccess}
          onChange={smsTemplatesValidation.handleChange}
          onClear={() => smsTemplatesValidation.setFieldValue('smsBody', '')}
          error={smsTemplatesValidation.touched.smsBody && Boolean(smsTemplatesValidation.errors.smsBody)}
          helperText={smsTemplatesValidation.touched.smsBody && smsTemplatesValidation.errors.smsBody}
        />
      </Grid>
    </Grid>
  )
}

export default smsTemplatesTab
