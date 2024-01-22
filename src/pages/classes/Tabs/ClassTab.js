// ** MUI Imports
import { Grid } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

const ClassTab = ({ classValidation, _labels, maxAccess, editMode, charOperatorComboStore }) => {
  return (
    <>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={_labels.name}
            value={classValidation.values.name}
            required
            onChange={classValidation.handleChange}
            onClear={() => classValidation.setFieldValue('name', '')}
            error={classValidation.touched.name && Boolean(classValidation.errors.name)}
            helperText={classValidation.touched.name && classValidation.errors.name}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomComboBox
            name='characteristicOperator'
            label={_labels.charOperator}
            valueField='key'
            displayField='value'
            store={charOperatorComboStore}
            value={classValidation.values.characteristicOperator && charOperatorComboStore.filter(item => item.key === classValidation.values.characteristicOperator.toString())[0]}
            required
            onChange={(event, newValue) => {
              classValidation.setFieldValue('characteristicOperator', newValue?.key)
            }}
            error={classValidation.touched.characteristicOperator && Boolean(classValidation.errors.characteristicOperator)}
            helperText={classValidation.touched.characteristicOperator && classValidation.errors.characteristicOperator}
            maxAccess={maxAccess}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default ClassTab
