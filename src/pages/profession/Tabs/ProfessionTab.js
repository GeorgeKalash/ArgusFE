// ** MUI Imports
import { Grid } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import { useState } from 'react'
import { handleChangeNumber } from 'src/lib/numberField-helper'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

const ProfessionTab=({
    labels,
    ProfessionValidation,
    maxAccess,
    diplomatStore
}) =>{


const [position, setPosition] = useState(0)

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
          
          <Grid item xs={12}>
            <CustomTextField
              position={position}
              name='monthlyIncome'
              type="text"
              label={labels.monthlyIncome}
              value={ProfessionValidation.values.monthlyIncome}
              required

              // readOnly
              maxAccess={maxAccess}

              onChange={e => {
                handleChangeNumber(
                  e.target,
                  8, // digitsBeforePoint
                  2, // digitsAfterPoint
                  ProfessionValidation,
                  setPosition,
                  'monthlyIncome'
                           );
              }}

              // onChange={e => {
              //   const input = e.target;
              //   const formattedValue = input.value  ? getFormattedNumberMax(input.value, 8, 2) : input.value ;

              //   // Save current cursor position
              //   const currentPosition = input.selectionStart;

              //   // Update field value
              //   ProfessionValidation.setFieldValue('monthlyIncome', formattedValue);

              //   // Calculate the new cursor position based on the formatted value
              //   const newCursorPosition =
              //     currentPosition +
              //     (formattedValue && formattedValue.length - input.value.length);

              //   setPosition(newCursorPosition);

              // }}

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

          <Grid item xs={12}>
            <CustomComboBox
              name='diplomatStatus'
              label={labels.diplomatStatus}
              valueField='key'
              displayField='value'
              store={diplomatStore}
              value={diplomatStore.filter(item => item.key === ProfessionValidation.values.diplomatStatus?.toString())[0]}
              required
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                ProfessionValidation.setFieldValue('diplomatStatus', newValue?.key)
              }}
              error={ProfessionValidation.touched.diplomatStatus && Boolean(ProfessionValidation.errors.diplomatStatus)}
              helperText={ProfessionValidation.touched.diplomatStatus && ProfessionValidation.errors.diplomatStatus}
            />
          </Grid>

          </Grid>
    )
}

export default ProfessionTab
