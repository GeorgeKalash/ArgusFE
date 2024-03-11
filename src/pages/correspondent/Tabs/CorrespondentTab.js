// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomLookup from 'src/components/Inputs/CustomLookup'
import ResourceComboBox from 'src/components/Shared/ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceLookup } from 'src/components/Shared/ResourceLookup'
import { BusinessPartnerRepository } from 'src/repositories/BusinessPartnerRepository'

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
        <ResourceLookup
         endpointId={BusinessPartnerRepository.MasterData.snapshot}
          name='bpRef'
          required
          label={labels.bpRef}
          valueField='reference'
          displayField='name'

          valueShow='bpRef'
          secondValueShow='bpName'

          form={correspondentValidation}
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
          errorCheck={'bpId'}
          maxAccess={maxAccess}
        />
      </Grid>
      <Grid item xs={12}>
            <ResourceComboBox
              endpointId={SystemRepository.Currency.qry}
              name='currencyId'
              label={labels.currency}
              valueField='recordId'
              displayField={['reference', 'name']}
              columnsInDropDown={[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' }
              ]}
              values={correspondentValidation.values}
              onChange={(event, newValue) => {
                correspondentValidation.setFieldValue('currencyId', newValue?.recordId)
              }}
              error={correspondentValidation.touched.countryId && Boolean(correspondentValidation.errors.countryId)}
              helperText={correspondentValidation.touched.countryId && correspondentValidation.errors.countryId}
            />
          </Grid>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              name='isInactive'
              checked={correspondentValidation.values?.isInactive}
              onChange={correspondentValidation.handleChange}
              maxAccess={maxAccess}
            />
          }
          label={labels.isInactive}
        />
      </Grid>

    </Grid>
  )
}

export default CorrespondentTab
