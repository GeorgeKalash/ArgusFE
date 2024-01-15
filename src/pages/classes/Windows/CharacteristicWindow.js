// ** MUI Imports
import { Grid, Box } from '@mui/material'

// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'


const CharacteristicWindow = ({
  onClose,
  onSave,
  characteristicValidation,
  characteristicComboStore,
  characValueComboStore,
  _labels,
  maxAccess,
  fillCharacValueComboStore
}) => {
  return (
    <Window id='CharacteristicWindow' Title={_labels.characteristic} onClose={onClose} onSave={onSave} width={500} height={300}>
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
                  name='chId'
                  label={_labels.characteristic}
                  valueField='recordId'
                  displayField='name'
                  store={characteristicComboStore}
                  value={characteristicComboStore && characteristicComboStore.filter(item => item.recordId === characteristicValidation.values.chId)[0]}
                  required
                  onChange={(event, newValue) => {
                    characteristicValidation.setFieldValue('chId', newValue?.recordId)  
                    const selectedCharacId = newValue?.recordId || ''
                    console.log('chId ' + selectedCharacId)
                    fillCharacValueComboStore(selectedCharacId) // Fetch and update according to this selection
                    console.log('characValueCombo')
                    console.log(characValueComboStore)
                  }}
                  error={characteristicValidation.touched.chId && Boolean(characteristicValidation.errors.chId)}
                  helperText={characteristicValidation.touched.chId && characteristicValidation.errors.chId}
                  maxAccess={maxAccess}
                />
              </Grid>
              <Grid item xs={12}>
              {characValueComboStore && (
                <CustomComboBox
                  name='seqNo'
                  label={_labels.value}
                  valueField='seqNo'
                  displayField='value'
                  store={characValueComboStore}
                  value={characValueComboStore.filter(item => item.seqNo === characteristicValidation.values.seqNo)[0]}
                  required
                  onChange={(event, newValue) => {
                    characteristicValidation.setFieldValue('seqNo', newValue?.seqNo)
                  }}
                  error={characteristicValidation.touched.seqNo && Boolean(characteristicValidation.errors.seqNo)}
                  helperText={characteristicValidation.touched.seqNo && characteristicValidation.errors.seqNo}
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

export default CharacteristicWindow
