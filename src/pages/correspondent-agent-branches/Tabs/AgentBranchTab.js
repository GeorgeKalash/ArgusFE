// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

const AgentTab=({
    labels,
    agentBranchValidation,
    maxAccess,
    agentStore
}) =>{
    return (
        <Grid container spacing={4}>


          <Grid item xs={12}>
                    <CustomComboBox
                        name='agent'
                        label={labels.agent}
                        valueField='recordId'
                        displayField='name'
                        store={agentStore}
                        value={agentStore.filter(item => item.recordId === agentBranchValidation.values.agent)[0]}
                        onChange={(event, newValue) => {
                          agentBranchValidation.setFieldValue('agent', newValue?.recordId)
                        }}
                        error={agentBranchValidation.touched.agent && Boolean(agentBranchValidation.errors.agent)}
                        helperText={agentBranchValidation.touched.agent && agentBranchValidation.errors.agent}
                    />
                </Grid>
        </Grid>
    )
}

export default AgentTab
