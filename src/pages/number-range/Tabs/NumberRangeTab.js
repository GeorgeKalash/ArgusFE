// ** MUI Imports
import { Grid } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomTextArea from 'src/components/Inputs/CustomTextArea'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'
import {FormControlLabel} from '@mui/material'
import {Checkbox} from '@mui/material'

const NumberRangeTab=({
    labels,
    NumberRangeValidation,
    maxAccess, setRequired
}) =>{

console.log('YES' ,NumberRangeValidation)

    return (
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <CustomTextField
              name='reference'
              label={labels.reference}
              value={NumberRangeValidation.values.reference}
              required
              onChange={NumberRangeValidation.handleChange}
              maxLength = '10'
              maxAccess={maxAccess}
              onClear={() => NumberRangeValidation.setFieldValue('reference', '')}
              error={NumberRangeValidation.touched.reference && Boolean(NumberRangeValidation.errors.reference)}
              helperText={NumberRangeValidation.touched.reference && NumberRangeValidation.errors.reference}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextArea
              name='description'
              label={labels.description}
              value={NumberRangeValidation.values.description}
              required
              rows={2}
              maxAccess={maxAccess}
              onChange={NumberRangeValidation.handleChange}
              onClear={() => NumberRangeValidation.setFieldValue('description', '')}
              error={NumberRangeValidation.touched.description && Boolean(NumberRangeValidation.errors.description)}
              helperText={NumberRangeValidation.touched.description && NumberRangeValidation.errors.description}
            />
          </Grid>



          <Grid item xs={12}>
            <CustomTextField
              name='min'
              label={labels.min}
              value={NumberRangeValidation.values.min}
              required
              type=""
              maxLength='15'
              maxAccess={maxAccess}
              onChange={NumberRangeValidation.handleChange}
              onClear={() => NumberRangeValidation.setFieldValue('min', '')}
              error={NumberRangeValidation.touched.max && Boolean(NumberRangeValidation.errors.min)}
              helperText={NumberRangeValidation.touched.max && NumberRangeValidation.errors.min}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              name='max'
              label={labels.max}
              value={NumberRangeValidation.values.max}
              required
              type=""
              maxLength='15'
              maxAccess={maxAccess}
              onChange={NumberRangeValidation.handleChange}
              onClear={() => NumberRangeValidation.setFieldValue('max', '')}
              error={NumberRangeValidation.touched.max && Boolean(NumberRangeValidation.errors.max)}
              helperText={NumberRangeValidation.touched.max && NumberRangeValidation.errors.max}
            />
          </Grid>

           <Grid item xs={12}>
            <CustomTextField
              name='current'
              label={labels.current}
              value={NumberRangeValidation.values.current}
              required
              type="number"
              maxAccess={maxAccess}
              onChange={NumberRangeValidation.handleChange}
              onClear={() => NumberRangeValidation.setFieldValue('current', '')}
              error={NumberRangeValidation.touched.current && Boolean(NumberRangeValidation.errors.current)}
              helperText={NumberRangeValidation.touched.current && NumberRangeValidation.errors.current}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel

              control={
                <Checkbox
                  name='external'
                  checked={NumberRangeValidation.values?.external}
                  onChange={NumberRangeValidation.handleChange}


                />
              }
              label={labels.external}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel

              control={
                <Checkbox
                  name='dateRange'
                  checked={NumberRangeValidation.values?.dateRange}
                  onChange={(e , newValue) => {
                    console.log(newValue)

                    NumberRangeValidation.setFieldValue('dateRange', newValue);
                    NumberRangeValidation.setFieldValue('startDate', null);
                    NumberRangeValidation.setFieldValue('endDate', null);

                     setRequired(newValue)
                    NumberRangeValidation.handleChange(e);  // handleChange doesn't need parentheses

                  }}
                />
              }
              label={labels.dateRange}
            />
          </Grid>



          <Grid item xs={12} sx={{ opacity: !NumberRangeValidation.values.dateRange  ? 0.4 : 1, pointerEvents: !NumberRangeValidation.values.dateRange ? 'none' : 'auto'}}>
            <CustomDatePicker
              name='startDate'
              label={labels.startDate}
              value={ NumberRangeValidation.values.startDate}
              required={NumberRangeValidation.values.dateRange && true}
              readOnly={!NumberRangeValidation.values.dateRange && true}
              onChange={NumberRangeValidation.handleChange}
              maxAccess={maxAccess}
              onClear={() => NumberRangeValidation.setFieldValue('startDate', '')}
              error={NumberRangeValidation.touched.startDate && Boolean(NumberRangeValidation.errors.startDate)}
              helperText={NumberRangeValidation.touched.startDate && NumberRangeValidation.errors.startDate}
            />
          </Grid>
          <Grid item xs={12} sx={{ opacity: !NumberRangeValidation.values.dateRange  ? 0.4 : 1, pointerEvents: !NumberRangeValidation.values.dateRange ? 'none' : 'auto'}}>
            <CustomDatePicker
              name='endDate'
              label={labels.endDate}
              value={ NumberRangeValidation.values.endDate}
              required={NumberRangeValidation.values.dateRange && true}
              readOnly={!NumberRangeValidation.values.dateRange && true}
              onChange={NumberRangeValidation.handleChange}
              maxAccess={maxAccess}
              onClear={() => NumberRangeValidation.setFieldValue('endDate', '')}
              error={NumberRangeValidation.touched.endDate && Boolean(NumberRangeValidation.errors.endDate)}
              helperText={NumberRangeValidation.touched.endDate && NumberRangeValidation.errors.endDate}
            />
          </Grid>
          </Grid>
    )
}

export default NumberRangeTab
