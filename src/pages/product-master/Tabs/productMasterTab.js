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
  languageStore,
  labels
}) => {

  return (
    <>
      <Grid container>
        {/* First Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <CustomTextField
              name='reference'
              label={labels.reference}
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
              label={labels.name}
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
              label={labels.type}
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
              label={labels.function}
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
              name='correspondant'
              label={labels.correspondant}
              value={productMasterValidation.values.correspondant}

              //following are an example edit as needed
              //for more complex scenario a function can be passed 
              //returning bool depending on set of if or switch
              required={productMasterValidation.values.type === 1 ? true : false}
              
              //readOnly={productMasterValidation.values.type === 2 ? true : false}
              // disabled={productMasterValidation.values.type === 2 ? true : false}

              onChange={productMasterValidation.handleChange}
              onClear={() => productMasterValidation.setFieldValue('correspondant', '')}
              error={
                Boolean(productMasterValidation.errors.correspondant)
              }
              helperText={productMasterValidation.errors.correspondant}
            />
          </Grid>
        </Grid>
        {/* Second Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <CustomComboBox
              name='language'
              label={labels.language}
              valueField='key'
              displayField='value'
              store={languageStore}
              value={languageStore.filter(item => item.key === productMasterValidation.values.language)[0]}
              required
              onChange={(event, newValue) => {
                productMasterValidation.setFieldValue('language', newValue?.key)
              }}
              error={
                Boolean(productMasterValidation.errors.language)
              }
              helperText={productMasterValidation.errors.language}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox name='interfaceId' label='Interface' />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='commissionBase'
              label={labels.commissionBase}
              valueField='key'
              displayField='value'
              store={commissionBaseStore}
              value={commissionBaseStore.filter(item => item.recordId === productMasterValidation.values.commissionBase)[0]}
              required
              onChange={(event, newValue) => {
                productMasterValidation.setFieldValue('commissionBase', newValue?.value)
              }}
              error={
                productMasterValidation.errors.commissionBase
              }
              helperText={productMasterValidation.errors.commissionBase}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='posMsg'
              label={labels.messageToOperator}
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
              label={labels.activateCounterMessage}
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
              label={labels.isInactive}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default ProductMasterTab
