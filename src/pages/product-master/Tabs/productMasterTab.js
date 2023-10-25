// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

const ProductMasterTab = ({
  productMasterValidation,
  typeStore,
  commissionBaseStore,
  languageStore,
  currencyStore
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
              error={productMasterValidation.touched.reference && Boolean(productMasterValidation.errors.reference)}
              helperText={productMasterValidation.touched.reference && productMasterValidation.errors.reference}
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
              error={productMasterValidation.touched.name && Boolean(productMasterValidation.errors.name)}
              helperText={productMasterValidation.touched.name && productMasterValidation.errors.name}
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
              error={productMasterValidation.touched.type && Boolean(productMasterValidation.errors.type)}
              helperText={productMasterValidation.touched.type && productMasterValidation.errors.type}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='correspondant'
              label='Correspondant'
              value={productMasterValidation.values.correspondant}

              //following are an example edit as needed
              //for more complex scenario a function can be passed 
              //returning bool depending on set of if or switch
              required={productMasterValidation.values.type === 1 ? true : false}
              readOnly={productMasterValidation.values.type === 2 ? true : false}
              disabled={productMasterValidation.values.type === 2 ? true : false}

              onChange={productMasterValidation.handleChange}
              onClear={() => productMasterValidation.setFieldValue('correspondant', '')}
              error={
                productMasterValidation.touched.correspondant && Boolean(productMasterValidation.errors.correspondant)
              }
              helperText={productMasterValidation.touched.correspondant && productMasterValidation.errors.correspondant}
            />
          </Grid>
          <Grid item xs={12}>

            {/* as currency combo below */}
            <CustomComboBox name='countryName' label='Country' required />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='currencyName'
              label='Currency'
              valueField='recordId'
              displayField='name'
              store={currencyStore}
              value={currencyStore.filter(item => item.recordId === productMasterValidation.values.currencyId)[0]}
              required
              onChange={(event, newValue) => {
                productMasterValidation.setFieldValue('currencyId', newValue?.recordId)
              }}
              error={
                productMasterValidation.touched.currencyName && Boolean(productMasterValidation.errors.currencyName)
              }
              helperText={productMasterValidation.touched.currencyName && productMasterValidation.errors.currencyName}
            />
          </Grid>
        </Grid>
        {/* Second Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <CustomComboBox
              name='languageName'
              label='Language'
              valueField='key'
              displayField='value'
              store={languageStore}
              value={productMasterValidation.values.languageName}
              required
              onChange={(event, newValue) => {
                productMasterValidation.setFieldValue('language', newValue?.key)
                productMasterValidation.setFieldValue('languageName', newValue?.value)
              }}
              error={
                productMasterValidation.touched.languageName && Boolean(productMasterValidation.errors.languageName)
              }
              helperText={productMasterValidation.touched.languageName && productMasterValidation.errors.languageName}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox name='interfaceName' label='Interface' />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='commissionBase'
              label='Commission Base'
              valueField='key'
              displayField='value'
              store={commissionBaseStore}
              value={productMasterValidation.values.commissionBaseName}
              required
              onChange={(event, newValue) => {
                productMasterValidation.setFieldValue('commissionBase', newValue?.key)
                productMasterValidation.setFieldValue('commissionBaseName', newValue?.value)
              }}
              error={
                productMasterValidation.touched.commissionBaseName &&
                Boolean(productMasterValidation.errors.commissionBaseName)
              }
              helperText={
                productMasterValidation.touched.commissionBaseName && productMasterValidation.errors.commissionBaseName
              }
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
              error={productMasterValidation.touched.posMsg && Boolean(productMasterValidation.errors.posMsg)}
              helperText={productMasterValidation.touched.posMsg && productMasterValidation.errors.posMsg}
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
