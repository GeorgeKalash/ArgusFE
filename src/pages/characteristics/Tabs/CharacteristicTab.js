// ** MUI Imports
import { Grid, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomDatePicker from 'src/components/Inputs/CustomDatePicker'

import { getFormattedNumberMax } from 'src/lib/numberField-helper'

const CharacteristicTab = ({ characteristicValidation, _labels, maxAccess, editMode, currencyStore, dataTypeStore }) => {
  return (
    <>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={_labels.name}
            value={characteristicValidation.values.name}
            required
            onChange={characteristicValidation.handleChange}
            onClear={() => characteristicValidation.setFieldValue('name', '')}
            error={characteristicValidation.touched.name && Boolean(characteristicValidation.errors.name)}
            helperText={characteristicValidation.touched.name && characteristicValidation.errors.name}
            maxLength='40'
            maxAccess={maxAccess}
            readOnly={editMode}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomComboBox
            name='dataType'
            label={_labels.dataType}
            valueField='key'
            displayField='value'
            store={dataTypeStore}
            value={dataTypeStore.filter(item => item.key === characteristicValidation.values.dataType?.toString())[0]}
            required
            onChange={(event, newValue) => {
              characteristicValidation.setFieldValue('dataType', newValue?.key)
            }}
            error={characteristicValidation.touched.dataType && Boolean(characteristicValidation.errors.dataType)}
            helperText={characteristicValidation.touched.dataType && characteristicValidation.errors.dataType}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='propertyName'
            label={_labels.property}
            value={characteristicValidation.values.propertyName}
            required
            onChange={characteristicValidation.handleChange}
            onClear={() => characteristicValidation.setFieldValue('propertyName', '')}
            error={
              characteristicValidation.touched.propertyName && Boolean(characteristicValidation.errors.propertyName)
            }
            helperText={characteristicValidation.touched.propertyName && characteristicValidation.errors.propertyName}
            maxLength='30'
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                name='isRange'
                maxAccess={maxAccess}
                checked={characteristicValidation.values?.isRange}
                onChange={characteristicValidation.handleChange}
              />
            }
            label={_labels.isRange}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                name='isMultiple'
                maxAccess={maxAccess}
                checked={characteristicValidation.values?.isMultiple}
                onChange={characteristicValidation.handleChange}
              />
            }
            label={_labels.isMultiple}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                name='allowNegative'
                maxAccess={maxAccess}
                checked={characteristicValidation.values?.allowNegative}
                onChange={characteristicValidation.handleChange}
              />
            }
            label={_labels.allowNeg}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                name='caseSensitive'
                maxAccess={maxAccess}
                checked={characteristicValidation.values?.caseSensitive}
                onChange={characteristicValidation.handleChange}
              />
            }
            label={_labels.caseSensitive}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomComboBox
            name='currencyId'
            label={_labels.currency}
            valueField='recordId'
            displayField='name'  
            required
            store={currencyStore}
            value={currencyStore.filter(item => item.recordId === characteristicValidation.values.currencyId)[0]}
            onChange={(event, newValue) => {
              characteristicValidation.setFieldValue('currencyId', newValue?.recordId)
            }}
            columnsInDropDown={[
              { key: 'reference', value: 'Reference' },
              { key: 'name', value: 'Name' }
            ]}
            error={characteristicValidation.touched.currencyId && Boolean(characteristicValidation.errors.currencyId)}
            helperText={characteristicValidation.touched.currencyId && characteristicValidation.errors.currencyId}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='textSize'
            label={_labels.textSize}
            value={characteristicValidation.values.textSize}
            onChange={e => characteristicValidation.setFieldValue('textSize', getFormattedNumberMax(e.target.value, 10, 3))}
            onClear={() => characteristicValidation.setFieldValue('textSize', '')}
            error={characteristicValidation.touched.textSize && Boolean(characteristicValidation.errors.textSize)}
            helperText={characteristicValidation.touched.textSize && characteristicValidation.errors.textSize}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
            <CustomDatePicker
              name='validFrom'
              label={_labels.validFrom}
              value={ characteristicValidation.values.validFrom}
              required
              onChange={characteristicValidation.handleChange}
              maxAccess={maxAccess}
              onClear={() => characteristicValidation.setFieldValue('validFrom', '')}
              error={characteristicValidation.touched.validFrom && Boolean(characteristicValidation.errors.validFrom)}
              helperText={characteristicValidation.touched.validFrom && characteristicValidation.errors.validFrom}
            />
          </Grid>
      </Grid>
    </>
  )
}

export default CharacteristicTab
