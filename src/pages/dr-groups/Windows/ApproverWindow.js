// ** MUI Imports
import { Grid, Box } from '@mui/material'

// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'


const ApproverWindow = ({
  onClose,
  onSave,
  approverValidation,
  approverComboStore,
  _labels,
  maxAccess
}) => {
  return (
    <Window id='ApproverWindow' Title={_labels.approver} onClose={onClose} onSave={onSave} width={500} height={300}>
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
                <CustomComboBox
                  name='codeId'
                  label={_labels.approver}
                  valueField='recordId'
                  displayField='name'
                  store={approverComboStore}
                  value={approverComboStore.filter(item => item.recordId === approverValidation.values.codeId)[0]}
                  required
                  onChange={(event, newValue) => {
                    approverValidation.setFieldValue('codeId', newValue?.recordId)
                  }}
                  error={approverValidation.touched.codeId && Boolean(approverValidation.errors.codeId)}
                  helperText={approverValidation.touched.codeId && approverValidation.errors.codeId}
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

export default ApproverWindow
