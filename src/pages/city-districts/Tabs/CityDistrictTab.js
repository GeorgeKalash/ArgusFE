// ** MUI Imports
import { Grid } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomLookup from 'src/components/Inputs/CustomLookup'


const CityDistrictTab = ({
  cityDistrictValidation,
  countryStore,
  _labels,
  maxAccess,
  editMode,
  cityStore,
  setCityStore,
  lookupCity
}) => {
  return (
    <>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomTextField
            name='reference'
            label={_labels.reference}
            value={cityDistrictValidation.values.reference}
            readOnly={editMode}
            required
            onChange={cityDistrictValidation.handleChange}
            onClear={() => cityDistrictValidation.setFieldValue('reference', '')}
            error={cityDistrictValidation.touched.reference && Boolean(cityDistrictValidation.errors.reference)}
            helperText={cityDistrictValidation.touched.reference && cityDistrictValidation.errors.reference}
            maxLength='10'
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomTextField
            name='name'
            label={_labels.name}
            value={cityDistrictValidation.values.name}
            required
            onChange={cityDistrictValidation.handleChange}
            onClear={() => cityDistrictValidation.setFieldValue('name', '')}
            error={cityDistrictValidation.touched.name && Boolean(cityDistrictValidation.errors.name)}
            helperText={cityDistrictValidation.touched.name && cityDistrictValidation.errors.name}
            maxLength='40'
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomComboBox
            name='countryId'
            label={_labels.country}
            required
            valueField='recordId'
            displayField='name'
            store={countryStore}
            value={countryStore.filter(item => item.recordId === cityDistrictValidation.values.countryId)[0]}
            onChange={(event, newValue) => {
              cityDistrictValidation.setFieldValue('countryId', newValue?.recordId)
              cityDistrictValidation.setFieldValue('cityId', null) //city lookup depends on countryId
              cityDistrictValidation.setFieldValue('cityRef', null)
              cityDistrictValidation.setFieldValue('cityName', null)
            }}
            error={cityDistrictValidation.touched.countryId && Boolean(cityDistrictValidation.errors.countryId)}
            helperText={cityDistrictValidation.touched.countryId && cityDistrictValidation.errors.countryId}
            maxAccess={maxAccess}
          />
        </Grid>
        <Grid item xs={12}>
          <CustomLookup
            name='cityRef'
            label={_labels.city}
            valueField='reference'
            displayField='name'
            value={cityDistrictValidation.values.cityId}
            required
            store={cityStore}
            firstValue={cityDistrictValidation.values.cityRef}
            secondValue={cityDistrictValidation.values.cityName}
            setStore={setCityStore}
            onLookup={lookupCity}
            onChange={(event, newValue) => {
              console.log(newValue)
              if (newValue) {
                cityDistrictValidation.setFieldValue('cityId', newValue?.recordId)
                cityDistrictValidation.setFieldValue('cityRef', newValue?.reference)
                cityDistrictValidation.setFieldValue('cityName', newValue?.name)
              } else {
                cityDistrictValidation.setFieldValue('cityId', null)
                cityDistrictValidation.setFieldValue('cityRef', null)
                cityDistrictValidation.setFieldValue('cityName', null)
              }
            }}
            error={cityDistrictValidation.touched.cityId && Boolean(cityDistrictValidation.errors.cityId)}
            helperText={cityDistrictValidation.touched.cityId && cityDistrictValidation.errors.cityId}
            maxAccess={maxAccess}
          />
        </Grid>
      </Grid>
    </>
  )
}

export default CityDistrictTab
