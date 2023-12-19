// ** MUI Imports
import { Grid } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'


const PlantTab = ({
  plantValidation,
  costCenterStore,
  plantGroupStore,
  segmentStore,
  _labels,
  maxAccess,
  editMode
}) => {
  return (
    <>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={_labels.reference}
            value={plantValidation.values.reference}
            readOnly={editMode}
            required
            onChange={plantValidation.handleChange}
            onClear={() => plantValidation.setFieldValue('reference', '')}
            error={plantValidation.touched.reference && Boolean(plantValidation.errors.reference)}
            helperText={plantValidation.touched.reference && plantValidation.errors.reference}
            maxLength='4'
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={_labels.name}
            value={plantValidation.values.name}
            required
            onChange={plantValidation.handleChange}
            onClear={() => plantValidation.setFieldValue('name', '')}
            error={plantValidation.touched.name && Boolean(plantValidation.errors.name)}
            helperText={plantValidation.touched.name && plantValidation.errors.name}
            maxLength='40'
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='licenseNo'
            label={_labels.licenseNo}
            value={plantValidation.values.licenseNo}
            onChange={plantValidation.handleChange}
            onClear={() => plantValidation.setFieldValue('licenseNo', '')}
            error={plantValidation.touched.licenseNo && Boolean(plantValidation.errors.licenseNo)}
            helperText={plantValidation.touched.licenseNo && plantValidation.errors.licenseNo}
            maxLength='40'
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='crNo'
            label={_labels.commReg}
            value={plantValidation.values.crNo}
            onChange={plantValidation.handleChange}
            onClear={() => plantValidation.setFieldValue('crNo', '')}
            error={plantValidation.touched.crNo && Boolean(plantValidation.errors.crNo)}
            helperText={plantValidation.touched.crNo && plantValidation.errors.crNo}
            maxLength='40'
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomComboBox
            name='costCenterId'
            label={_labels.costCenter}
            valueField='recordId'
            displayField='name'
            store={costCenterStore}
            value={costCenterStore.filter(item => item.recordId === plantValidation.values.costCenterId)[0]}
            onChange={(event, newValue) => {
              plantValidation.setFieldValue('costCenterId', newValue?.recordId)
            }}
            error={plantValidation.touched.costCenterId && Boolean(plantValidation.errors.costCenterId)}
            helperText={plantValidation.touched.costCenterId && plantValidation.errors.costCenterId}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomComboBox
            name='groupId'
            label={_labels.plantGrp}
            valueField='recordId'
            displayField='name'
            store={plantGroupStore}
            value={plantGroupStore.filter(item => item.recordId === plantValidation.values.groupId)[0]}
            onChange={(event, newValue) => {
              plantValidation.setFieldValue('groupId', newValue?.recordId)
            }}
            error={plantValidation.touched.groupId && Boolean(plantValidation.errors.groupId)}
            helperText={plantValidation.touched.groupId && plantValidation.errors.groupId}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomComboBox
            name='segmentRef'
            label={_labels.segment}
            valueField='reference'
            displayField='reference'
            store={segmentStore}
            value={segmentStore.filter(item => item.reference === plantValidation.values.segmentRef)[0]}
            columnsInDropDown= {[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' },
            ]}
            onChange={(event, newValue) => {
              plantValidation.setFieldValue('segmentRef', newValue?.reference)
            }}
            error={plantValidation.touched.segmentRef && Boolean(plantValidation.errors.segmentRef)}
            helperText={plantValidation.touched.segmentRef && plantValidation.errors.segmentRef}
            maxAccess={maxAccess}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default PlantTab
