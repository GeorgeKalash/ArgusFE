// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

const AgentBranchTab = ({ labels, agentBranchValidation, maxAccess, agentStore, setAgentStore, lookupAgentData }) => {


  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
     { agentStore &&  <CustomComboBox
          name='agentId'
          label={labels.agent}
          valueField='recordId'
          displayField='name'
          required
          store={agentStore}
          value={agentStore?.filter(item => item.recordId === agentBranchValidation.values.agentId)[0] }
          onChange={(event, newValue) => {
            agentBranchValidation.setFieldValue('agentId', newValue?.recordId)
          }}
          error={agentBranchValidation.touched.agentId && Boolean(agentBranchValidation.errors.agentId)}
          helperText={agentBranchValidation.touched.agentId && agentBranchValidation.errors.agentId}
        />}
      </Grid>

      <Grid item xs={12}>
        <CustomTextField
          name='swiftCode'
          label={labels.swiftCode}
          value={agentBranchValidation.values.swiftCode}
          required
          maxLength='20'
          onChange={agentBranchValidation.handleChange}
          onClear={() => agentBranchValidation.setFieldValue('swiftCode', '')}
          error={agentBranchValidation.touched.swiftCode && Boolean(agentBranchValidation.errors.swiftCode)}
          helperText={agentBranchValidation.touched.swiftCode && agentBranchValidation.errors.swiftCode}
        />
      </Grid>

    </Grid>
  )
}

export default AgentBranchTab
