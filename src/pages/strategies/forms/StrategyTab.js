// ** MUI Imports
import { Grid } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

const StrategyTab = ({ strategyValidation, _labels, maxAccess, editMode, typeComboStore, strategyGroupComboStore }) => {
  return (
    <>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={_labels.name}
            value={strategyValidation.values.name}
            required
            onChange={strategyValidation.handleChange}
            onClear={() => strategyValidation.setFieldValue('name', '')}
            error={strategyValidation.touched.name && Boolean(strategyValidation.errors.name)}
            helperText={strategyValidation.touched.name && strategyValidation.errors.name}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomComboBox
            name='groupId'
            label={_labels.group}
            valueField='recordId'
            displayField='name'
            store={strategyGroupComboStore}
            value={strategyGroupComboStore.filter(item => item.recordId === strategyValidation.values.groupId)[0]}
            required
            onChange={(event, newValue) => {
              strategyValidation.setFieldValue('groupId', newValue?.recordId)
            }}
            error={strategyValidation.touched.groupId && Boolean(strategyValidation.errors.groupId)}
            helperText={strategyValidation.touched.groupId && strategyValidation.errors.groupId}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomComboBox
            name='type'
            label={_labels.type}
            valueField='key'
            displayField='value'
            store={typeComboStore}
            value={strategyValidation.values.type != null? typeComboStore.filter(item => item.key === strategyValidation.values.type.toString())[0] : ''}
            required
            onChange={(event, newValue) => {
              strategyValidation.setFieldValue('type', newValue?.key)
            }}
            error={strategyValidation.touched.type && Boolean(strategyValidation.errors.type)}
            helperText={strategyValidation.touched.type && strategyValidation.errors.type}
            maxAccess={maxAccess}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default StrategyTab
