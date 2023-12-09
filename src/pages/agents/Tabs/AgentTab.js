// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

const AgentTab=({
    labels,
    agentValidation,
    maxAccess
}) =>{
    return (
        <Grid container spacing={4}>       
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={agentValidation.values.name}
              required
              maxLength = '50'
              maxAccess={maxAccess}
              onChange={agentValidation.handleChange}
              onClear={() => agentValidation.setFieldValue('name', '')}
              error={agentValidation.touched.name && Boolean(agentValidation.errors.name)}
              helperText={agentValidation.touched.name && agentValidation.errors.name}
            />
          </Grid>
        </Grid>
    )
}

export default AgentTab