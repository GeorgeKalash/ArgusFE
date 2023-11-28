// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

const ProductMasterTab = ({
  productMasterValidation,
  typeStore,
  functionStore,
  commissionBaseStore,
  languageStore
}) => {
  return (
    <>
      <Grid container>
        {/* First Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <CustomTextField
              name='reference'
              label='Reference'
              value={productMasterValidation.values.reference}
              required
              readOnly={false}
              onChange={productMasterValidation.handleChange}
              onClear={() => productMasterValidation.setFieldValue('reference', '')}
              error={Boolean(productMasterValidation.errors.reference)}
              helperText={productMasterValidation.errors.reference}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label='Name'
              value={productMasterValidation.values.name}
              required
              onChange={productMasterValidation.handleChange}
              onClear={() => productMasterValidation.setFieldValue('name', '')}
              error={productMasterValidation.errors.name}
              helperText={productMasterValidation.errors.name}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='type'
              label='Type'
              valueField='key'
              displayField='value'
              store={typeStore}
              value={typeStore.filter(item => item.key === productMasterValidation.values.type)[0]}
              required
              onChange={(event, newValue) => {
                productMasterValidation.setFieldValue('type', newValue?.key)
              }}
              error={Boolean(productMasterValidation.errors.type)}
              helperText={productMasterValidation.errors.type}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='function'
              label='Function'
              valueField='key'
              displayField='value'
              store={functionStore}
              value={functionStore.filter(item => item.key === productMasterValidation.values.function)[0]}
              required
              onChange={(event, newValue) => {
                productMasterValidation.setFieldValue('function', newValue?.key)
              }}
              error={Boolean(productMasterValidation.errors.function)}
              helperText={productMasterValidation.errors.function}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='correspondent'
              label='Correspondent'
              value={productMasterValidation.values.correspondent}

              //required={productMasterValidation.values.type === 1 ? true : false}
              onChange={productMasterValidation.handleChange}
              onClear={() => productMasterValidation.setFieldValue('correspondent', '')}
              error={Boolean(productMasterValidation.errors.correspondent)}
              helperText={productMasterValidation.errors.correspondent}
            />
          </Grid>
        </Grid>
        {/* Second Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <CustomComboBox
              name='language'
              label='language'
              valueField='key'
              displayField='value'
              store={languageStore}
              value={languageStore.filter(item => item.key === productMasterValidation.values.language)[0]}
              required
              onChange={(event, newValue) => {
                productMasterValidation.setFieldValue('language', newValue?.key)
              }}
              error={Boolean(productMasterValidation.errors.language)}
              helperText={productMasterValidation.errors.language}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox name='interfaceId' label='Interface' />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='commissionBase'
              label='Commission Base'
              valueField='key'
              displayField='value'
              store={commissionBaseStore}
              value={productMasterValidation.values.commissionBaseName}
              onChange={(event, newValue) => {
                productMasterValidation.setFieldValue('commissionBase', newValue?.key)
                productMasterValidation.setFieldValue('commissionBaseName', newValue?.value)
              }}
              error={Boolean(productMasterValidation.errors.commissionBaseName)}
              helperText={productMasterValidation.errors.commissionBaseName}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='posMsg'
              label='Message To Operator'
              value={productMasterValidation.values.posMsg}
              readOnly={false}
              onChange={productMasterValidation.handleChange}
              onClear={() => productMasterValidation.setFieldValue('posMsg', '')}
              error={Boolean(productMasterValidation.errors.posMsg)}
              helperText={productMasterValidation.errors.posMsg}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name='posMsgIsActive'
                  checked={productMasterValidation.values?.posMsgIsActive}
                  onChange={productMasterValidation.handleChange}
                />
              }
              label='Activate Counter Message'
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name='isInactive'
                  checked={productMasterValidation.values?.isInactive}
                  onChange={productMasterValidation.handleChange}
                />
              }
              label='Is inactive'
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default ProductMasterTab
