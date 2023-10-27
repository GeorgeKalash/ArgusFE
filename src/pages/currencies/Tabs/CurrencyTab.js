// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomTextField from 'src/components/Inputs/CustomTextField'

const CurrencyTab=({
    labels,
    currencyValidation,
    decimalStore,
    profileStore,
    currencyStore,
    editMode
}) =>{
    return (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <CustomTextField
              name='reference'
              label={labels.reference}
              value={currencyValidation.values.reference}
              required
              onChange={currencyValidation.handleChange}
              inputProps={{ maxLength: '3' }}
              onClear={() => currencyValidation.setFieldValue('reference', '')}
              error={currencyValidation.touched.reference && Boolean(currencyValidation.errors.reference)}
              helperText={currencyValidation.touched.reference && currencyValidation.errors.reference}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={currencyValidation.values.name}
              required
              onChange={currencyValidation.handleChange}
              onClear={() => currencyValidation.setFieldValue('name', '')}
              error={currencyValidation.touched.name && Boolean(currencyValidation.errors.name)}
              helperText={currencyValidation.touched.name && currencyValidation.errors.name}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='flName'
              label={labels.foreignLanguage}
              value={currencyValidation.values.flName}
              required
              onChange={currencyValidation.handleChange}
              onClear={() => currencyValidation.setFieldValue('flName', '')}
              error={currencyValidation.touched.flName && Boolean(currencyValidation.errors.flName)}
              helperText={currencyValidation.touched.flName && currencyValidation.errors.flName}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='decimals'
              label={labels.decimals}
              valueField='decimals'
              displayField='decimals'
              store={decimalStore}
              value={currencyValidation.values.decimals}
              required
              onChange={(event, newValue) => {
                currencyValidation.setFieldValue('decimals', newValue?.decimals)
              }}
              error={currencyValidation.touched.decimals && Boolean(currencyValidation.errors.decimals)}
              helperText={currencyValidation.touched.decimals && currencyValidation.errors.decimals}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='profileId'
              label={labels.profile}
              valueField='key'
              displayField='value'
              store={profileStore}
              value={profileStore.filter(item => item.key === currencyValidation.values.profileId)[0]}
              required
              onChange={(event, newValue) => {
                currencyValidation.setFieldValue('profileId', newValue?.key)
              }}
              error={currencyValidation.touched.profileId && Boolean(currencyValidation.errors.profileId)}
              helperText={currencyValidation.touched.profileId && currencyValidation.errors.profileId}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='currencyType'
              label={labels.currencyType}
              valueField='key'
              displayField='value'
              store={currencyStore}
              value={currencyStore.filter(item => item.key === currencyValidation.values.currencyType)[0]}
              required
              readOnly={editMode}
              onChange={(event, newValue) => {
                currencyValidation.setFieldValue('currencyType', newValue?.key)
                currencyValidation.setFieldValue('currencyTypeName', newValue?.value)
              }}
              error={
                currencyValidation.touched.currencyTypeName && Boolean(currencyValidation.errors.currencyTypeName)
              }
              helperText={currencyValidation.touched.currencyTypeName && currencyValidation.errors.currencyTypeName}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name='sale'
                  checked={currencyValidation.values?.sale}
                  onChange={currencyValidation.handleChange}
                />
              }
              label={labels.sales}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name='purchase'
                  checked={currencyValidation.values?.purchase}
                  onChange={currencyValidation.handleChange}
                />
              }
              label={labels.purchase}
            />
          </Grid>
        </Grid>
    )
}

export default CurrencyTab