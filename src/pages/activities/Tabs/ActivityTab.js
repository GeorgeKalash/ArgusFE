// ** MUI Imports
import { Grid } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'


const ActivityTab = ({
  activityValidation,
  industryStore,
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
            value={activityValidation.values.reference}
            readOnly={editMode}
            required
            onChange={activityValidation.handleChange}
            onClear={() => activityValidation.setFieldValue('reference', '')}
            error={activityValidation.touched.reference && Boolean(activityValidation.errors.reference)}
            helperText={activityValidation.touched.reference && activityValidation.errors.reference}
            maxLength='10'
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={_labels.name}
            value={activityValidation.values.name}
            required
            onChange={activityValidation.handleChange}
            onClear={() => activityValidation.setFieldValue('name', '')}
            error={activityValidation.touched.name && Boolean(activityValidation.errors.name)}
            helperText={activityValidation.touched.name && activityValidation.errors.name}
            maxLength='50'
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='flName'
            label={_labels.flName}
            value={activityValidation.values.flName}
            onChange={activityValidation.handleChange}
            onClear={() => activityValidation.setFieldValue('flName', '')}
            error={activityValidation.touched.flName && Boolean(activityValidation.errors.flName)}
            helperText={activityValidation.touched.flName && activityValidation.errors.flName}
            maxLength='50'
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomComboBox
            name='industry'
            label={_labels.industryId}
            valueField='key'
            displayField='value'
            required
            store={industryStore}
            value={industryStore.filter(item => item.key === activityValidation.values.industry)[0]}
            onChange={(event, newValue) => {
              activityValidation.setFieldValue('industry', newValue?.key)
            }}
            error={activityValidation.touched.industry && Boolean(activityValidation.errors.industry)}
            helperText={activityValidation.touched.industry && activityValidation.errors.industry}
            maxAccess={maxAccess}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default ActivityTab
