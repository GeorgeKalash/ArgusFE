
// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'

// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'


const UsersTab = ({ 
    labels, 
    usersValidation, 
    maxAccess, 
    notificationGrpStore,
    languageStore,
    userTypeStore,
    activeStatusStore
}) => {
  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <CustomTextField
          name='name'
          label={labels.name}
          value={usersValidation.values.name}
          required
          maxAccess={maxAccess}
          minLength='5'
          onChange={usersValidation.handleChange}
          onClear={() => usersValidation.setFieldValue('name', '')}
          error={usersValidation.touched.name && Boolean(usersValidation.errors.name)}
          helperText={usersValidation.touched.name && usersValidation.errors.name}
        />
      </Grid>
      <Grid item xs={12}>
        <CustomTextField
          name='username'
          label={labels.username}
          value={usersValidation.values.username}
          required
          maxAccess={maxAccess}
          minLength='6'
          maxLength='30'
          onChange={usersValidation.handleChange}
          onClear={() => usersValidation.setFieldValue('username', '')}
          error={usersValidation.touched.username && Boolean(usersValidation.errors.username)}
          helperText={usersValidation.touched.username && usersValidation.errors.username}
        />
      </Grid>
      <Grid item xs={12}>
            <CustomTextField
              name='email'
              label={labels.email}
              value={usersValidation.values.email}
              type='email'
              placeholder='johndoe@email.com'
              onChange={usersValidation.handleChange}
              onClear={() => usersValidation.setFieldValue('email', '')}
              error={usersValidation.touched.email && Boolean(usersValidation.errors.email)}
              helperText={usersValidation.touched.email && usersValidation.errors.email}
            />
          </Grid>
        <Grid item xs={12}>
        <CustomTextField
          name='cellPhone'
          label={labels.cellPhone}
          value={usersValidation.values.cellPhone}
          maxAccess={maxAccess}
          onChange={usersValidation.handleChange}
          onClear={() => usersValidation.setFieldValue('cellPhone', '')}
          error={usersValidation.touched.cellPhone && Boolean(usersValidation.errors.cellPhone)}
          helperText={usersValidation.touched.cellPhone && usersValidation.errors.cellPhone}
        />
      </Grid>
      <Grid item xs={12}>
      <CustomTextField
          name='password'
          label={labels.password}
          value={usersValidation.values.password}
          required
          maxAccess={maxAccess}
          onChange={usersValidation.handleChange}
          onClear={() => usersValidation.setFieldValue('password', '')}
          error={usersValidation.touched.password && Boolean(usersValidation.errors.password)}
          helperText={usersValidation.touched.password && usersValidation.errors.password}
        />
      </Grid>
      <Grid item xs={12}>
      <CustomTextField
          name='confirmPassword'
          label={labels.confirmPassword}
          value={usersValidation.values.confirmPassword}
          required
          maxAccess={maxAccess}
          onChange={usersValidation.handleChange}
          onClear={() => usersValidation.setFieldValue('confirmPassword', '')}
          error={usersValidation.touched.confirmPassword && Boolean(usersValidation.errors.confirmPassword)}
          helperText={usersValidation.touched.confirmPassword && usersValidation.errors.confirmPassword}
        />
      </Grid>
      <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name='umcpnl'
                    checked={usersValidation.values?.umcpnl}
                    onChange={usersValidation.handleChange}
                  />
                }
                label={labels.umcpnl}
              />
            </Grid>
    </Grid>
  )
}

export default UsersTab
