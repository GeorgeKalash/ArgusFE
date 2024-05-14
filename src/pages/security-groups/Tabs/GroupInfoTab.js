// ** MUI Imports
import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const GroupInfoTab = ({ labels, groupInfoValidation, maxAccess }) => {
  return (
    <VertLayout>
      <Grow>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={groupInfoValidation.values.name}
              required
              maxLength='30'
              maxAccess={maxAccess}
              onChange={groupInfoValidation.handleChange}
              onClear={() => groupInfoValidation.setFieldValue('name', '')}
              error={groupInfoValidation.touched.name && Boolean(groupInfoValidation.errors.name)}
              helperText={groupInfoValidation.touched.name && groupInfoValidation.errors.name}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='description'
              label={labels.description}
              value={groupInfoValidation.values.description}
              rows={3}
              maxLength='150'
              maxAccess={maxAccess}
              onChange={groupInfoValidation.handleChange}
              onClear={() => groupInfoValidation.setFieldValue('description', '')}
              error={groupInfoValidation.touched.description && Boolean(groupInfoValidation.errors.description)}
              helperText={groupInfoValidation.touched.description && groupInfoValidation.errors.description}
            />
          </Grid>
        </Grid>{' '}
      </Grow>
    </VertLayout>
  )
}

export default GroupInfoTab
