// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

const AgentTab = ({ labels, agentValidation, countryStore, maxAccess }) => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <CustomTextField
          name='name'
          label={labels.name}
          value={agentValidation.values.name}
          required
          maxLength='50'
          maxAccess={maxAccess}
          onChange={agentValidation.handleChange}
          onClear={() => agentValidation.setFieldValue('name', '')}
          error={agentValidation.touched.name && Boolean(agentValidation.errors.name)}
          helperText={agentValidation.touched.name && agentValidation.errors.name}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomComboBox
          name='countryId'
          label={labels.country}
          valueField='recordId'
          displayField='name'
          store={countryStore}
          value={countryStore.filter(item => item.recordId === agentValidation.values.countryId)[0]} // Ensure the value matches an option or set it to null
          required
          maxAccess={maxAccess}
          onChange={(event, newValue) => {
            agentValidation.setFieldValue('countryId', newValue?.recordId)
          }}
          error={agentValidation.touched.countryId && Boolean(agentValidation.errors.countryId)}
          helperText={agentValidation.touched.countryId && agentValidation.errors.countryId}
        />
      </Grid>
    </Grid>
  )
}

export default AgentTab
