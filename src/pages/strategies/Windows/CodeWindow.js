// ** MUI Imports
import { Grid, Box } from '@mui/material'

// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'


const CodeWindow = ({
  onClose,
  onSave,
  codeValidation,
  codeComboStore,
  _labels,
  maxAccess
}) => {
  return (
    <Window id='CodeWindow' Title={_labels.code} onClose={onClose} onSave={onSave} width={500} height={300}>
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
                  label={_labels.code}
                  valueField='codeId'
                  displayField='codeName'
                  store={codeComboStore}
                  value={codeComboStore && codeComboStore.filter(item => item.codeId === codeValidation.values.codeId)[0]}
                  required
                  onChange={(event, newValue) => {
                    codeValidation.setFieldValue('codeId', newValue?.codeId)  
                  }}
                  error={codeValidation.touched.codeId && Boolean(codeValidation.errors.codeId)}
                  helperText={codeValidation.touched.codeId && codeValidation.errors.codeId}
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

export default CodeWindow
