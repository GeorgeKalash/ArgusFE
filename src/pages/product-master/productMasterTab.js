// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Third Party Imports
import { useFormik } from 'formik'
import * as yup from 'yup'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

const ProductMasterTab = ({ productMasterValidation, typeStore, commissionBaseStore, languageStore }) => {
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
              name='typeName'
              label='Type'
              valueField='key'
              displayField='value'
              store={typeStore}
              value={productMasterValidation.values.typeName}
              required
              onChange={(event, newValue) => {
                productMasterValidation.setFieldValue('type', newValue?.key)
                productMasterValidation.setFieldValue('typeName', newValue?.value)
              }}
              error={productMasterValidation.touched.typeName && Boolean(productMasterValidation.errors.typeName)}
              helperText={productMasterValidation.touched.typeName && productMasterValidation.errors.typeName}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='correspondant'
              label='Correspondant'
              value={productMasterValidation.values.correspondant}
              required
              readOnly={false}
              onChange={productMasterValidation.handleChange}
              onClear={() => productMasterValidation.setFieldValue('correspondant', '')}
              error={
                productMasterValidation.touched.correspondant && Boolean(productMasterValidation.errors.correspondant)
              }
              helperText={productMasterValidation.touched.correspondant && productMasterValidation.errors.correspondant}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox name='countryName' label='Country' required />
          </Grid>
          <Grid item xs={12}>
            <CustomComboBox name='currencyName' label='Currency' />
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
