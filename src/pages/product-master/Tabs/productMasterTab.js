// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomLookup from 'src/components/Inputs/CustomLookup'

const ProductMasterTab = ({
  productMasterValidation,
  typeStore,
  functionStore,
  commissionBaseStore,
  correspondentStore,
  setCorrespondentStore,
  interfaceStore,
  lookupCorrespondent,
  languageStore,
  maxAccess
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
              maxAccess={maxAccess}
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
                // console.log("productMasterValidation")
                // console.log(productMasterValidation)
                //  console.log("productMasterValidation")
                productMasterValidation && productMasterValidation.setFieldValue('type', newValue?.key);
              }}
              error={productMasterValidation.touched.type && Boolean(productMasterValidation.errors.type)}
              helperText={productMasterValidation.touched.type && productMasterValidation.errors.type}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='functionId'
              label='Function'
              valueField='key'
              displayField='value'
              store={functionStore}
              value={functionStore.filter(item => item.key === productMasterValidation.values.functionId)[0]}
              required
              onChange={(event, newValue) => {
                productMasterValidation.setFieldValue('functionId', newValue?.key)
              }}
              error={productMasterValidation.touched.functionId && Boolean(productMasterValidation.errors.functionId)}
              helperText={productMasterValidation.touched.functionId && productMasterValidation.errors.functionId}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomLookup
              name='corId'

              // label={labels.correspondent}
              label='Correspondent'
              value={productMasterValidation.values.corId}
              required={productMasterValidation.values.type === 1 ? true : false}
              valueField='reference'
              displayField='name'
              store={correspondentStore}
              firstValue={productMasterValidation.values.corRef}
              secondValue={productMasterValidation.values.corName}
              setStore={setCorrespondentStore}
              onLookup={lookupCorrespondent}
              onChange={(event, newValue) => {
                if (newValue) {
                  productMasterValidation.setFieldValue('corId', newValue?.recordId)
                  productMasterValidation.setFieldValue('corRef', newValue?.reference)
                  productMasterValidation.setFieldValue('corName', newValue?.name)
                } else {
                  productMasterValidation.setFieldValue('corId', null)
                  productMasterValidation.setFieldValue('corRef', null)
                  productMasterValidation.setFieldValue('corName', null)
                }
              }}
              error={
                productMasterValidation.touched.corId &&
                Boolean(productMasterValidation.errors.corId)
              }
              helperText={
                productMasterValidation.touched.corId && productMasterValidation.errors.corId
              }
              maxAccess={maxAccess}
            />
          </Grid>
          {/* <Grid item xs={12}>
            <CustomTextField
              name='correspondent'
              label='Correspondent'
              value={productMasterValidation.values.correspondent}
              required={productMasterValidation.values.type === 1 ? true : false}
              onChange={productMasterValidation.handleChange}
              onClear={() => productMasterValidation.setFieldValue('correspondent', '')}
              error={Boolean(productMasterValidation.errors.correspondent)}
              helperText={productMasterValidation.errors.correspondent}
            />
          </Grid> */}
        </Grid>
        {/* Second Column */}
        <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <CustomComboBox
              name='languages'
              label='languages'
              valueField='key'
              displayField='value'
              store={languageStore}
              value={languageStore.filter(item => item.key === productMasterValidation.values.languages)[0]}
              onChange={(event, newValue) => {
                productMasterValidation.setFieldValue('languages', newValue?.key)
              }}
              error={productMasterValidation.touched.languages && Boolean(productMasterValidation.errors.languages)}
              helperText={productMasterValidation.touched.languages && productMasterValidation.errors.languages}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox
              name='interfaceId'
              label='Interface'
              valueField='recordId'
              displayField='name'
              store={interfaceStore}
              value={interfaceStore.filter(item => item.recordId === productMasterValidation.values.interfaceId)[0]}
              required
              onChange={(event, newValue) => {
                productMasterValidation.setFieldValue('interfaceId', newValue?.recordId)
              }}
              error={ productMasterValidation.touched.interfaceId && Boolean(productMasterValidation.errors.interfaceId)}
              helperText={productMasterValidation.touched.interfaceId && productMasterValidation.errors.interfaceId}
            />
          </Grid>


          <Grid item xs={12}>
            <CustomComboBox
              name='commissionBase'
              label='Commission Base'
              valueField='key'
              displayField='value'
              store={commissionBaseStore}
              value={commissionBaseStore.filter(item => item.key === productMasterValidation.values.commissionBase)[0]}
              required
              onChange={(event, newValue) => {
             productMasterValidation.setFieldValue('commissionBase', newValue?.key)
              }}
              error={productMasterValidation.touched.commissionBase && Boolean(productMasterValidation.errors.commissionBase)}
              helperText={productMasterValidation.touched.commissionBase && productMasterValidation.errors.commissionBase}
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
              error={ productMasterValidation.errors && Boolean(productMasterValidation.errors.posMsg)}
              helperText={productMasterValidation.errors && productMasterValidation.errors.posMsg}
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
