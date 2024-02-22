// ** MUI Imports
import { Grid, Box } from '@mui/material'

// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'


const PrerequisiteWindow = ({
  onClose,
  onSave,
  prerequisiteValidation,
  groupComboStore,
  prerequisiteComboStore,
  fillPrerequisiteComboStore,
  _labels,
  maxAccess
}) => {
  return (
    <Window id='PrerequisiteWindow' Title={_labels.prerequisite} onClose={onClose} onSave={onSave} width={500} height={300}>
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
                  label={_labels.group}
                  valueField='codeId'
                  displayField='name'
                  store={groupComboStore}
                  value={groupComboStore && groupComboStore.filter(item => item.codeId === prerequisiteValidation.values.codeId)[0]}
                  required
                  onChange={(event, newValue) => {
                    prerequisiteValidation.setFieldValue('codeId', newValue?.codeId)
                    const selectedCodeId = newValue?.codeId || ''
                    console.log('codeId ' + selectedCodeId)
                    fillPrerequisiteComboStore(selectedCodeId) // Fetch and update according to this selection
                  }}
                  error={prerequisiteValidation.touched.codeId && Boolean(prerequisiteValidation.errors.codeId)}
                  helperText={prerequisiteValidation.touched.codeId && prerequisiteValidation.errors.codeId}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
              {prerequisiteComboStore && (
                <CustomComboBox
                  name='prerequisiteId'
                  label={_labels.prerequisite}
                  valueField='codeId'
                  displayField='name'
                  store={prerequisiteComboStore}
                  value={prerequisiteComboStore && prerequisiteComboStore.filter(item => item.codeId === prerequisiteValidation.values.prerequisiteId)[0]}
                  required
                  onChange={(event, newValue) => {
                    prerequisiteValidation.setFieldValue('prerequisiteId', newValue?.codeId)
                  }}
                  error={prerequisiteValidation.touched.prerequisiteId && Boolean(prerequisiteValidation.errors.prerequisiteId)}
                  helperText={prerequisiteValidation.touched.prerequisiteId && prerequisiteValidation.errors.prerequisiteId}
                  maxAccess={maxAccess}
                />
                )}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </CustomTabPanel>
    </Window>
  )
}

export default PrerequisiteWindow
