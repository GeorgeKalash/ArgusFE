// ** MUI Imports
import { Grid } from '@mui/material'
import { useState } from 'react';

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { getFormattedNumber} from 'src/lib/numberField-helper'

const ProfessionTab=({
    labels,
    ProfessionValidation,
    maxAccess
}) =>{



    return (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <CustomTextField
              name='reference'
              label={labels.reference}
              value={ProfessionValidation.values.reference}
              required
              onChange={ProfessionValidation.handleChange}
              maxLength = '10'
              maxAccess={maxAccess}
              onClear={() => ProfessionValidation.setFieldValue('reference', '')}
              error={ProfessionValidation.touched.reference && Boolean(ProfessionValidation.errors.reference)}
              helperText={ProfessionValidation.touched.reference && ProfessionValidation.errors.reference}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={ProfessionValidation.values.name}
              required
              maxLength = '50'
              maxAccess={maxAccess}
              onChange={ProfessionValidation.handleChange}
              onClear={() => ProfessionValidation.setFieldValue('name', '')}
              error={ProfessionValidation.touched.name && Boolean(ProfessionValidation.errors.name)}
              helperText={ProfessionValidation.touched.name && ProfessionValidation.errors.name}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='flName'
              label={labels.flName}
              value={ProfessionValidation.values.flName}
              required
              maxLength = '50'
              maxAccess={maxAccess}
              onChange={ProfessionValidation.handleChange}
              onClear={() => ProfessionValidation.setFieldValue('flName', '')}
              error={ProfessionValidation.touched.flName && Boolean(ProfessionValidation.errors.flName)}
              helperText={ProfessionValidation.touched.flName && ProfessionValidation.errors.flName}
            />
          </Grid>
          {/* <Grid item xs={12}>
            <CustomTextField
              name='monthlyIncome'
              label={labels.monthlyIncome}
              value={ ProfessionValidation.values.monthlyIncome}
              required
              maxLength = '10'

              maxAccess={maxAccess}
              onChange={(e)=>{ProfessionValidation.handleChange }}
              onClear={() => ProfessionValidation.setFieldValue('monthlyIncome', '')}
              error={ProfessionValidation.touched.monthlyIncome && Boolean(ProfessionValidation.errors.monthlyIncome)}
              helperText={ProfessionValidation.touched.monthlyIncome && ProfessionValidation.errors.monthlyIncome}
            />
          </Grid> */}
          <Grid item xs={12}>
            <CustomTextField
              name='monthlyIncome'
              label={labels.monthlyIncome}
              value={ProfessionValidation.values.monthlyIncome}
              required
              maxLength='13'
              maxAccess={maxAccess}
              onChange={e => ProfessionValidation.setFieldValue('monthlyIncome', getFormattedNumber(e.target.value, 2))}
              onClear={() => ProfessionValidation.setFieldValue('monthlyIncome', '')}
              error={ProfessionValidation.touched.monthlyIncome && Boolean(ProfessionValidation.errors.monthlyIncome)}
              helperText={ProfessionValidation.touched.monthlyIncome && ProfessionValidation.errors.monthlyIncome}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='riskFactor'
              label={labels.riskFactor}
              value={ProfessionValidation.values.riskFactor}
              required
              type="number"
              maxAccess={maxAccess}
              onChange={ProfessionValidation.handleChange}
              onClear={() => ProfessionValidation.setFieldValue('riskFactor', '')}
              error={ProfessionValidation.touched.riskFactor && Boolean(ProfessionValidation.errors.riskFactor)}
              helperText={ProfessionValidation.touched.riskFactor && ProfessionValidation.errors.riskFactor}
            />
          </Grid>

          </Grid>
    )
}

export default ProfessionTab
