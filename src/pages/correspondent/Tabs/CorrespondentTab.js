// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomLookup from 'src/components/Inputs/CustomLookup'

const CorrespondentTab = ({
  labels,
  correspondentValidation,
  lookupBpMasterData,
  bpMasterDataStore,
  setBpMasterDataStore,
  editMode,
  maxAccess
}) => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <CustomTextField
          name='reference'
          label={labels.reference}
          value={correspondentValidation.values.reference}
          required
          onChange={correspondentValidation.handleChange}
          maxLength='10'
          maxAccess={maxAccess}
          onClear={() => correspondentValidation.setFieldValue('reference', '')}
          error={correspondentValidation.touched.reference && Boolean(correspondentValidation.errors.reference)}
          helperText={correspondentValidation.touched.reference && correspondentValidation.errors.reference}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name='name'
          label={labels.name}
          value={correspondentValidation.values.name}
          required
          maxLength='50'
          maxAccess={maxAccess}
          onChange={correspondentValidation.handleChange}
          onClear={() => correspondentValidation.setFieldValue('name', '')}
          error={correspondentValidation.touched.name && Boolean(correspondentValidation.errors.name)}
          helperText={correspondentValidation.touched.name && correspondentValidation.errors.name}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomLookup
          name='bpRef'
          required
          label={labels.bpRef}
          valueField='reference'
          displayField='name'
          store={bpMasterDataStore}
          setStore={setBpMasterDataStore}
          firstValue={correspondentValidation.values.bpRef}
          secondValue={correspondentValidation.values.bpName}
          onLookup={lookupBpMasterData}
          onChange={(event, newValue) => {
            if (newValue) {
              correspondentValidation.setFieldValue('bpId', newValue?.recordId)
              correspondentValidation.setFieldValue('bpRef', newValue?.reference)
              correspondentValidation.setFieldValue('bpName', newValue?.name)
            } else {
              correspondentValidation.setFieldValue('bpId', null)
              correspondentValidation.setFieldValue('bpRef', null)
              correspondentValidation.setFieldValue('bpName', null)
            }
          }}
          error={correspondentValidation.touched.bpId && Boolean(correspondentValidation.errors.bpId)}
          helperText={correspondentValidation.touched.bpId && correspondentValidation.errors.bpId}
          maxAccess={maxAccess}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              name='tt'
              checked={correspondentValidation.values?.tt}
              onChange={correspondentValidation.handleChange}
            />
          }
          label={labels.tt}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              name='inwards'
              checked={correspondentValidation.values?.inwards}
              onChange={correspondentValidation.inwards}
            />
          }
          label={labels.inwards}
        />
      </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              name='isInactive'
              checked={correspondentValidation.values?.isInactive}
              onChange={correspondentValidation.isInactive}
            />
          }
          label={labels.isInactive}
        />
      </Grid>
    </Grid>
  )
}

export default CorrespondentTab
