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
  readOnly= false,
  requiredOptional=false,
  editMode // not used since all fields are editable in edit mode
}) => {

  return (
    <>
      <Grid container>
        {/* First Column */}
        <Grid container rowGap={3} xs={6} sx={{ px: 2 }}>
          <Grid item xs={12}>
            <CustomTextField
              name='name'
              label={labels.name}
              value={addressValidation.values.name}
              required={requiredOptional ? false : true}
              readOnly={readOnly}
              maxLength='20'
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('name', '')}
              error={addressValidation.touched.name && Boolean(addressValidation.errors.name)}
              helperText={addressValidation.touched.name && addressValidation.errors.name}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='street1'
              label={labels.street1}
              value={addressValidation.values.street1}
              required={requiredOptional ? false : true}

              readOnly={readOnly}
              maxLength='20'
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('street1', '')}
              error={addressValidation.touched.street1 && Boolean(addressValidation.errors.street1)}
              helperText={addressValidation.touched.street1 && addressValidation.errors.street1}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='street2'
              label={labels.street2}
              value={addressValidation.values.street2}
              maxLength='20'
              readOnly={readOnly}
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('street2', '')}
              error={addressValidation.touched.street2 && Boolean(addressValidation.errors.street2)}
              helperText={addressValidation.touched.street2 && addressValidation.errors.street2}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='email1'
              label={labels.email}
              value={addressValidation.values.email1}
              type='email'
              onBlur={addressValidation.handleBlur}

              readOnly={readOnly}
              placeholder='johndoe@email.com'
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('email1', '')}
              error={addressValidation.touched.email1 && Boolean(addressValidation.errors.email1)}
              helperText={addressValidation.touched.email1 && addressValidation.errors.email1}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='email2'
              type='email'
              readOnly={readOnly}
              placeholder='johndoe@email.com'
              label={labels.email2}
              onBlur={addressValidation.handleBlur}

              value={addressValidation.values.email2}
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('email2', '')}
              error={addressValidation.touched.email2 && Boolean(addressValidation.errors.email2)}
              helperText={addressValidation.touched.email2 && addressValidation.errors.email2}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='bldgNo'
              label={labels.bldgNo}
              value={addressValidation.values.bldgNo}
              maxLength='10'
              readOnly={readOnly}
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('bldgNo', '')}
              error={addressValidation.touched.bldgNo && Boolean(addressValidation.errors.bldgNo)}
              helperText={addressValidation.touched.bldgNo && addressValidation.errors.bldgNo}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='unitNo'
              label={labels.unitNo}
              value={addressValidation.values.unitNo}
              maxLength='10'
              readOnly={readOnly}
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('unitNo', '')}
              error={addressValidation.touched.unitNo && Boolean(addressValidation.errors.unitNo)}
              helperText={addressValidation.touched.unitNo && addressValidation.errors.unitNo}
              maxAccess={maxAccess}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomTextField
              name='subNo'
              label={labels.subNo}
              value={addressValidation.values.subNo}
              maxLength='10'
              readOnly={readOnly}
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('subNo', '')}
              error={addressValidation.touched.subNo && Boolean(addressValidation.errors.subNo)}
              helperText={addressValidation.touched.subNo && addressValidation.errors.subNo}
              maxAccess={maxAccess}
            />
          </Grid>
        </Grid>
        {/* Second Column */}
        <Grid container rowGap={3} xs={6} sx={{ px: 2 }}>
          {/* <Grid item xs={12}>
            <CustomComboBox
              name='countryId'
              label={labels.country}
              valueField='countryId'
              required={requiredOptional ? false : true}

              readOnly={readOnly}
              store={countryStore}
              displayField={['reference','name']}
              displayFieldWidth={2}
              columnsInDropDown= {[
                { key: 'reference', value: 'Reference' },
                { key: 'name', value: 'Name' },
                { key: 'flName', value: 'Foreign Language Name' }
              ]}
              value={countryStore.filter(item => item.recordId === 1)[0]}
              onChange={(event, newValue) => {
                if(newValue){
                const selectedCountryId = newValue?.recordId || ''
                fillStateStore(selectedCountryId)
                addressValidation.setFieldValue('countryId', newValue?.recordId)


                }else{
                  addressValidation.setFieldValue('countryId', '')


                }

                addressValidation.setFieldValue('stateId', null)
                addressValidation.setFieldValue('cityId', null)
                addressValidation.setFieldValue('cityDistrictId', null)
                addressValidation.setFieldValue('city', null)
                addressValidation.setFieldValue('cityDistrict', null)
              }}
              error={addressValidation.touched.countryId && Boolean(addressValidation.errors.countryId)}
              helperText={addressValidation.touched.countryId && addressValidation.errors.countryId}
              maxAccess={maxAccess}
            />
          </Grid> */}
              <Grid item xs={12}>
                  <CustomComboBox
                    name="countryId"
                    label={labels.country}
                    valueField="recordId"
                    displayField={['reference','name']}
                    readOnly={readOnly}
                    store={countryStore}
                    displayFieldWidth={2}

                columnsInDropDown= {[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                  { key: 'flName', value: 'Foreign Language Name' }
                ]}
                    value={
                      countryStore.filter(
                        (item) =>
                          item.recordId ===
                          addressValidation.values.countryId,
                      )[0]
                    }
                    required
                    onChange={(event, newValue) => {
                      setCityStore([])

                      if(newValue){


                      addressValidation.setFieldValue(
                        "countryId",
                        newValue?.recordId,
                      );


                      fillStateStore(newValue?.recordId)



                    }else{

                        addressValidation.setFieldValue(
                          "countryId",
                          ''
                        );

                        fillStateStore(0)


                      }

                      addressValidation.setFieldValue('stateId', null)
                      addressValidation.setFieldValue('cityId', null)
                      addressValidation.setFieldValue('city', null)
                      addressValidation.setFieldValue('cityDistrictId', null)
                      addressValidation.setFieldValue('cityDistrict', null)
                    }}
                    error={
                      addressValidation.touched.countryId &&
                      Boolean(addressValidation.errors.countryId)
                    }
                    helperText={
                      addressValidation.touched.countryId &&
                      addressValidation.errors.countryId
                    }
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
                readOnly={readOnly}
                value={stateStore.filter(item => item.recordId === addressValidation.values.stateId)[0]}
                onChange={(event, newValue) => {
                  addressValidation.setFieldValue('stateId', newValue?.recordId)
                  addressValidation.setFieldValue('cityId', null)
                  addressValidation.setFieldValue('cityDistrictId', null)
                  addressValidation.setFieldValue('city', null)
                  addressValidation.setFieldValue('cityDistrict', null)
                }}
                error={addressValidation.touched.stateId && Boolean(addressValidation.errors.stateId)}
                helperText={addressValidation.touched.stateId && addressValidation.errors.stateId}
                maxAccess={maxAccess}
              />
            }
          </Grid>

          <Grid item xs={12}>
            <CustomLookup
              name='city'
              label={labels.city}
              required={requiredOptional ? false : true}
              readOnly={readOnly}
              valueField='name'
              displayField='name'
              store={cityStore}
              setStore={setCityStore}
              onLookup={lookupCity}
              firstValue={addressValidation.values.city}
              secondDisplayField={false}
              onChange={(event, newValue) => {
                if (newValue) {
                  addressValidation.setFieldValue('cityId', newValue?.recordId)
                  addressValidation.setFieldValue('city', newValue?.name)
                } else {
                  addressValidation.setFieldValue('cityId', null)
                  addressValidation.setFieldValue('city', null)
                }
                addressValidation.setFieldValue('cityDistrictId', null)
                addressValidation.setFieldValue('cityDistrict', null)
              }}
              error={addressValidation.touched.cityId && Boolean(addressValidation.errors.cityId)}
              helperText={addressValidation.touched.cityId && addressValidation.errors.cityId}
              maxAccess={maxAccess}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomLookup
              name='cityDistrict'
              label={labels.cityDistrict}
              valueField='name'
              displayField='name'
              readOnly={readOnly}
              store={cityDistrictStore}
              setStore={setCityDistrictStore}
              onLookup={lookupCityDistrict}
              firstValue={addressValidation.values.cityDistrict}
              secondDisplayField={false}
              onChange={(event, newValue) => {
                if (newValue) {
                  addressValidation.setFieldValue('cityDistrictId', newValue?.recordId)
                  addressValidation.setFieldValue('cityDistrict', newValue?.name)
                } else {
                  addressValidation.setFieldValue('cityDistrictId', null)
                  addressValidation.setFieldValue('cityDistrict', null)
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
              readOnly={readOnly}
              value={addressValidation.values.postalCode}
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('postalCode', '')}
              error={addressValidation.touched.postalCode && Boolean(addressValidation.errors.postalCode)}
              helperText={addressValidation.touched.postalCode && addressValidation.errors.postalCode}
              maxAccess={maxAccess}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              name='phone'
              label={labels.phone}
              value={addressValidation.values.phone}
              readOnly={readOnly}
              maxLength='15'
              type="text"
              phone={true}
              required={requiredOptional ? false : true}

              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('phone', '')}
              error={addressValidation.touched.phone && Boolean(addressValidation.errors.phone)}
              helperText={addressValidation.touched.phone && addressValidation.errors.phone}
              maxAccess={maxAccess}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              name='phone2'

              label={labels.phone2}
              value={addressValidation.values.phone2}
              maxLength='15'
              phone={true}
              readOnly={readOnly}
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('phone2', '')}
              error={addressValidation.touched.phone2 && Boolean(addressValidation.errors.phone2)}
              helperText={addressValidation.touched.phone2 && addressValidation.errors.phone2}
              maxAccess={maxAccess}
            />
          </Grid>

          <Grid item xs={12}>
            <CustomTextField
              name='phone3'
              label={labels.phone3}
              phone={true}
              value={addressValidation.values.phone3}
              maxLength='15'
              readOnly={readOnly}
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('phone3', '')}
              error={addressValidation.touched.phone3 && Boolean(addressValidation.errors.phone3)}
              helperText={addressValidation.touched.phone3 && addressValidation.errors.phone3}
              maxAccess={maxAccess}
            />
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

export default AddressTab
