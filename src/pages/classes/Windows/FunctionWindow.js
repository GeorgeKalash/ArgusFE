// ** MUI Imports
import { Grid, Box } from '@mui/material'

// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'


const FunctionWindow = ({
  onClose,
  onSave,
  functionValidation,
  functionComboStore,
  functionStrategyComboStore,
  _labels,
  maxAccess
}) => {
  return (
    <Window id='FunctionWindow' Title={_labels.functions} onClose={onClose} onSave={onSave} width={500} height={300}>
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
                  name='functionId'
                  label={_labels.function}
                  valueField='key'
                  displayField='value'
                  store={functionComboStore}
                  value={functionComboStore && functionValidation.values.functionId &&
                    functionComboStore.filter(item => item.key === functionValidation.values.functionId.toString())[0]}
                  required
                  onChange={(event, newValue) => {
                    functionValidation.setFieldValue('functionId', newValue?.key)
                  }}
                  error={functionValidation.touched.functionId && Boolean(functionValidation.errors.functionId)}
                  helperText={functionValidation.touched.functionId && functionValidation.errors.functionId}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
                <CustomComboBox
                  name='strategyId'
                  label={_labels.strategy}
                  valueField='recordId'
                  displayField='name'
                  store={functionStrategyComboStore}
                  value={functionStrategyComboStore && functionStrategyComboStore.filter(item => item.recordId === functionValidation.values.strategyId)[0]}
                  required
                  onChange={(event, newValue) => {
                    functionValidation.setFieldValue('strategyId', newValue?.recordId)
                  }}
                  error={functionValidation.touched.strategyId && Boolean(functionValidation.errors.strategyId)}
                  helperText={functionValidation.touched.strategyId && functionValidation.errors.strategyId}
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

export default FunctionWindow
