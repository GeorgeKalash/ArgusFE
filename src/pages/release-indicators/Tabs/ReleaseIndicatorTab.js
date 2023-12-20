// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

const ReleaseIndicatorTab = ({ releaseIndValidation, changeabilityStore, _labels, maxAccess, editMode }) => {
  return (
    <>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={_labels.reference}
            value={releaseIndValidation.values.reference}
            readOnly={editMode}
            required
            onChange={releaseIndValidation.handleChange}
            onClear={() => releaseIndValidation.setFieldValue('reference', '')}
            error={releaseIndValidation.touched.reference && Boolean(releaseIndValidation.errors.reference)}
            helperText={releaseIndValidation.touched.reference && releaseIndValidation.errors.reference}
            maxLength='1'
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={_labels.name}
            value={releaseIndValidation.values.name}
            required
            onChange={releaseIndValidation.handleChange}
            onClear={() => releaseIndValidation.setFieldValue('name', '')}
            error={releaseIndValidation.touched.name && Boolean(releaseIndValidation.errors.name)}
            helperText={releaseIndValidation.touched.name && releaseIndValidation.errors.name}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='recordId'
            label={_labels.id}
            value={releaseIndValidation.values.recordId}
            onChange={releaseIndValidation.handleChange}
            required

            /*onChange={e => releaseIndValidation.setFieldValue('recordId', getFormattedNumberMax(e.target.value, 1, 0))}*/
            onClear={() => releaseIndValidation.setFieldValue('recordId', '')}
            error={releaseIndValidation.touched.recordId && Boolean(releaseIndValidation.errors.recordId)}
            helperText={releaseIndValidation.touched.recordId && releaseIndValidation.errors.recordId}
            maxLength='1'
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomComboBox
            name='changeability'
            label={_labels.changeability}
            valueField='key'
            displayField='value'
            required
            store={changeabilityStore}
            value={changeabilityStore.filter(item => item.key === releaseIndValidation.values.changeability)[0]}
            onChange={(event, newValue) => {
              releaseIndValidation.setFieldValue('changeability', newValue?.key)
            }}
            error={releaseIndValidation.touched.changeability && Boolean(releaseIndValidation.errors.changeability)}
            helperText={releaseIndValidation.touched.changeability && releaseIndValidation.errors.changeability}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                name='isReleased'
                maxAccess={maxAccess}
                checked={releaseIndValidation.values?.isReleased}
                onChange={releaseIndValidation.handleChange}
              />
            }
            label={_labels.isReleased}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default ReleaseIndicatorTab
