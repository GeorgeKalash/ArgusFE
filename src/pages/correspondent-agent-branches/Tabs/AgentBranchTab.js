import { Grid, FormControlLabel, Checkbox } from '@mui/material'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const AgentBranchTab = ({ labels, agentBranchValidation, maxAccess, agentStore, setAgentStore, lookupAgentData }) => {
  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            {agentStore && (
              <CustomComboBox
                name='agentId'
                label={labels.agent}
                valueField='recordId'
                displayField='name'
                required
                store={agentStore}
                value={agentStore?.filter(item => item.recordId === agentBranchValidation.values.agentId)[0]}
                onChange={(event, newValue) => {
                  agentBranchValidation.setFieldValue('agentId', newValue?.recordId)
                }}
                error={agentBranchValidation.touched.agentId && Boolean(agentBranchValidation.errors.agentId)}
                helperText={agentBranchValidation.touched.agentId && agentBranchValidation.errors.agentId}
              />
            )}
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
      </Grow>
    </VertLayout>
  )
}

export default AgentBranchTab
