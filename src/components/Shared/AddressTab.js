// ** MUI Imports
import { Grid } from '@mui/material'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomLookup from 'src/components/Inputs/CustomLookup'

const AddressTab = ({
  labels,
  addressValidation,
  maxAccess,
  countryStore,
  stateStore,
  fillStateStore,
  lookupCity,
  cityStore,
  setCityStore,
  lookupCityDistrict,
  cityDistrictStore,
  setCityDistrictStore,
  editMode // not used since all fields are editable in edit mode
}) => {
  console.log(addressValidation)

  return (
    <>
      <Grid container>
        {/* First Column */}
        <Grid container rowGap={3} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={labels.addName}
              value={addressValidation.values.name}
              required
              maxLength='20'
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('name', '')}
              error={addressValidation.touched.name && Boolean(addressValidation.errors.name)}
              helperText={addressValidation.touched.name && addressValidation.errors.name}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='street1'
              label={labels.street1}
              value={addressValidation.values.street1}
              required
              maxLength='20'
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('street1', '')}
              error={addressValidation.touched.street1 && Boolean(addressValidation.errors.street1)}
              helperText={addressValidation.touched.street1 && addressValidation.errors.street1}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='street2'
              label={labels.street2}
              value={addressValidation.values.street2}
              maxLength='20'
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('street2', '')}
              error={addressValidation.touched.street2 && Boolean(addressValidation.errors.street2)}
              helperText={addressValidation.touched.street2 && addressValidation.errors.street2}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='email'
              label={labels.email}
              value={addressValidation.values.email}
              type='email'
              placeholder='johndoe@email.com'
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('email', '')}
              error={addressValidation.touched.email && Boolean(addressValidation.errors.email)}
              helperText={addressValidation.touched.email && addressValidation.errors.email}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='email2'
              type='email'
              placeholder='johndoe@email.com'
              label={labels.email2}
              value={addressValidation.values.email2}
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('email2', '')}
              error={addressValidation.touched.email2 && Boolean(addressValidation.errors.email2)}
              helperText={addressValidation.touched.email2 && addressValidation.errors.email2}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='bldgNo'
              label={labels.bldgNo}
              value={addressValidation.values.bldgNo}
              maxLength='10'
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('bldgNo', '')}
              error={addressValidation.touched.bldgNo && Boolean(addressValidation.errors.bldgNo)}
              helperText={addressValidation.touched.bldgNo && addressValidation.errors.bldgNo}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='unitNo'
              label={labels.unitNo}
              value={addressValidation.values.unitNo}
              maxLength='10'
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('unitNo', '')}
              error={addressValidation.touched.unitNo && Boolean(addressValidation.errors.unitNo)}
              helperText={addressValidation.touched.unitNo && addressValidation.errors.unitNo}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='subNo'
              label={labels.subNo}
              value={addressValidation.values.subNo}
              maxLength='10'
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('subNo', '')}
              error={addressValidation.touched.subNo && Boolean(addressValidation.errors.subNo)}
              helperText={addressValidation.touched.subNo && addressValidation.errors.subNo}
            />
          </Grid>
        </Grid>
        {/* Second Column */}
        <Grid container rowGap={3} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <CustomComboBox
              name='countryId'
              label={labels.country}
              valueField='countryId'
              required
              displayField='name'
              store={countryStore}
              value={countryStore.filter(item => item.recordId === addressValidation.values.countryId)[0]}
              onChange={(event, newValue) => {
                addressValidation.setFieldValue('countryId', newValue?.recordId)
                const selectedCountryId = newValue?.recordId || ''
                fillStateStore(selectedCountryId)
                addressValidation.setFieldValue('stateId', null)
                addressValidation.setFieldValue('cityId', null)
                addressValidation.setFieldValue('cityDistrictId', null)
                addressValidation.setFieldValue('cityName', null)
                addressValidation.setFieldValue('cityDistrictName', null)
              }}
              error={addressValidation.touched.countryId && Boolean(addressValidation.errors.countryId)}
              helperText={addressValidation.touched.countryId && addressValidation.errors.countryId}
            />
          </Grid>
          <Grid item xs={12}>
            {
              
              //stateStore &&
              <CustomComboBox
                name='stateId'
                label={labels.state}
                valueField='stateId'
                displayField='name'
                store={stateStore}
                value={stateStore.filter(item => item.recordId === addressValidation.values.stateId)[0]}
                onChange={(event, newValue) => {
                  addressValidation.setFieldValue('stateId', newValue?.recordId)
                  addressValidation.setFieldValue('cityId', null)
                  addressValidation.setFieldValue('cityDistrictId', null)
                  addressValidation.setFieldValue('cityName', null)
                  addressValidation.setFieldValue('cityDistrictName', null)
                }}
                error={addressValidation.touched.stateId && Boolean(addressValidation.errors.stateId)}
                helperText={addressValidation.touched.stateId && addressValidation.errors.stateId}
              />
            }
          </Grid>

          <Grid item xs={12}>
            <CustomLookup
              name='cityName'
              label={labels.city}
              required
              valueField='name'
              displayField='name'
              store={cityStore}
              setStore={setCityStore}
              onLookup={lookupCity}
              firstValue={addressValidation.values.cityName}
              secondDisplayField={false}
              onChange={(event, newValue) => {
                if (newValue) {
                  addressValidation.setFieldValue('cityId', newValue?.recordId)
                  addressValidation.setFieldValue('cityName', newValue?.name)
                } else {
                  addressValidation.setFieldValue('cityId', null)
                  addressValidation.setFieldValue('cityName', null)
                }
                addressValidation.setFieldValue('cityDistrictId', null)
                addressValidation.setFieldValue('cityDistrictName', null)
              }}
              error={addressValidation.touched.cityId && Boolean(addressValidation.errors.cityId)}
              helperText={addressValidation.touched.cityId && addressValidation.errors.cityId}
              maxAccess={maxAccess}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomLookup
              name='cityDistrictName'
              label={labels.cityDistrict}
              valueField='name'
              displayField='name'
              store={cityDistrictStore}
              setStore={setCityDistrictStore}
              onLookup={lookupCityDistrict}
              firstValue={addressValidation.values.cityDistrictName}
              secondDisplayField={false}
              onChange={(event, newValue) => {
                if (newValue) {
                  addressValidation.setFieldValue('cityDistrictId', newValue?.recordId)
                  addressValidation.setFieldValue('cityDistrictName', newValue?.name)
                } else {
                  addressValidation.setFieldValue('cityDistrictId', null)
                  addressValidation.setFieldValue('cityDistrictName', null)
                }
              }}
              error={addressValidation.touched.cityDistrictId && Boolean(addressValidation.errors.cityDistrictId)}
              helperText={addressValidation.touched.cityDistrictId && addressValidation.errors.cityDistrictId}
              maxAccess={maxAccess}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              name='postalCode'
              label={labels.postalCode}
              value={addressValidation.values.postalCode}
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('postalCode', '')}
              error={addressValidation.touched.postalCode && Boolean(addressValidation.errors.postalCode)}
              helperText={addressValidation.touched.postalCode && addressValidation.errors.postalCode}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              name='phone'
              label={labels.phone}
              value={addressValidation.values.phone}
              maxLength='20'
              required
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('phone', '')}
              error={addressValidation.touched.phone && Boolean(addressValidation.errors.phone)}
              helperText={addressValidation.touched.phone && addressValidation.errors.phone}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              name='phone2'
              label={labels.phone2}
              value={addressValidation.values.phone2}
              maxLength='20'
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('phone2', '')}
              error={addressValidation.touched.phone2 && Boolean(addressValidation.errors.phone2)}
              helperText={addressValidation.touched.phone2 && addressValidation.errors.phone2}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              name='phone3'
              label={labels.phone3}
              value={addressValidation.values.phone3}
              maxLength='20'
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('phone3', '')}
              error={addressValidation.touched.phone3 && Boolean(addressValidation.errors.phone3)}
              helperText={addressValidation.touched.phone3 && addressValidation.errors.phone3}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default AddressTab
