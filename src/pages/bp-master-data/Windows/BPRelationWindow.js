// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomLookup from 'src/components/Inputs/CustomLookup'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'


const BPRelationWindow = ({
  onClose,
  onSave,
  relationValidation,
  relationStore,
  lookupBusinessPartner,
  businessPartnerStore,
  setBusinessPartnerStore,
  labels,
  maxAccess
}) => {
  return (
    <Window id='BPRelationWindow' Title={labels.relation} onClose={onClose} onSave={onSave} width={600} height={400}>
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
            <CustomLookup
              name='toBPId'
              label= {labels.businessPartner}
              value={relationValidation.values.toBPId}
              required
              valueField='reference'
              displayField='name'
              store={businessPartnerStore}
              
              //firstValue={relationValidation.values.corRef}
              //secondValue={relationValidation.values.corName}
              setStore={setBusinessPartnerStore}
              onLookup={lookupBusinessPartner}
              onChange={(event, newValue) => {
                if (newValue) {
                  relationValidation.setFieldValue('toBPId', newValue?.recordId)

                  //relationValidation.setFieldValue('corRef', newValue?.reference)
                  //relationValidation.setFieldValue('corName', newValue?.name)
                } else {
                  relationValidation.setFieldValue('toBPId', null)

                  //relationValidation.setFieldValue('corRef', null)
                  //relationValidation.setFieldValue('corName', null)
                }
              }}
              error={
                relationValidation.touched.toBPId &&
                Boolean(relationValidation.errors.toBPId)
              }
              helperText={
                relationValidation.touched.toBPId && relationValidation.errors.toBPId
              }
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='relationId'
              label={labels.relation}
              valueField='recordId'
              displayField='name'
              store={relationStore}
              value={relationStore.filter(item => item.recordId === relationValidation.values.relationId)[0]}
              required
              onChange={(event, newValue) => {
                relationValidation && relationValidation.setFieldValue('relationId', newValue?.recordId);
              }}
              error={relationValidation.touched.relationId && Boolean(relationValidation.errors.relationId)}
              helperText={relationValidation.touched.relationId && relationValidation.errors.relationId}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomDatePicker
              name='startDate'
              label={labels.from}
              value={relationValidation.values.startDate}
              onChange={relationValidation.handleChange}
              maxAccess={maxAccess}
              onClear={() => relationValidation.setFieldValue('startDate', '')}
              error={relationValidation.touched.startDate && Boolean(relationValidation.errors.startDate)}
              helperText={relationValidation.touched.startDate && relationValidation.errors.startDate}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomDatePicker
              name='endDate'
              label={labels.to}
              value={relationValidation.values.endDate}
              onChange={relationValidation.handleChange}
              maxAccess={maxAccess}
              onClear={() => relationValidation.setFieldValue('endDate', '')}
              error={relationValidation.touched.endDate && Boolean(relationValidation.errors.endDate)}
              helperText={relationValidation.touched.endDate && relationValidation.errors.endDate}
            />
          </Grid>

             </Grid>
          </Grid>
        </Box>
      </CustomTabPanel>
    </Window>
  )
}

export default BPRelationWindow
