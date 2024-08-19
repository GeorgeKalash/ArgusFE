import { Grid } from '@mui/material'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from './ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceLookup } from './ResourceLookup'
import FormGrid from 'src/components/form/layout/FormGrid'
import useResourceParams from 'src/hooks/useResourceParams'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from './Layouts/VertLayout'
import { Grow } from './Layouts/Grow'

const AddressTab = ({ addressValidation, readOnly = false, required = true }) => {
  const { labels: labels, access: maxAccess } = useResourceParams({
    datasetId: ResourceIds.Address
  })

  return (
    <VertLayout>
      <Grid container gap={2}>
        <Grow>
          <Grid container gap={2}>
            <FormGrid hideonempty xs={12}>
              <ResourceComboBox
                endpointId={SystemRepository.Country.qry}
                name='countryId'
                label={labels.country}
                valueField='recordId'
                displayField={['reference', 'name']}
                readOnly={readOnly}
                required={required}
                displayFieldWidth={1.5}
                columnsInDropDown={[
                  { key: 'reference', value: 'Reference' },
                  { key: 'name', value: 'Name' },
                  { key: 'flName', value: 'Foreign Language Name' }
                ]}
                values={addressValidation.values}
                onChange={(event, newValue) => {
                  addressValidation.setFieldValue('stateId', null)
                  addressValidation.setFieldValue('cityId', '')
                  addressValidation.setFieldValue('city', '')
                  addressValidation.setFieldValue('cityDistrictId', '')
                  addressValidation.setFieldValue('cityDistrict', '')
                  if (newValue) {
                    addressValidation.setFieldValue('countryId', newValue?.recordId)
                  } else {
                    addressValidation.setFieldValue('countryId', '')
                  }
                }}
                error={addressValidation.touched.countryId && Boolean(addressValidation.errors.countryId)}
                maxAccess={maxAccess}
              />
            </FormGrid>
            <FormGrid hideonempty xs={12}>
              <ResourceComboBox
                endpointId={addressValidation.values.countryId && SystemRepository.State.qry}
                parameters={
                  addressValidation.values.countryId && `_countryId=${addressValidation.values.countryId || 0}`
                }
                name='stateId'
                label={labels.state}
                valueField='recordId'
                displayField='name'
                readOnly={(readOnly || !addressValidation.values.countryId) && true}
                values={addressValidation.values}
                onChange={(event, newValue) => {
                  addressValidation.setFieldValue('stateId', newValue?.recordId)
                  addressValidation.setFieldValue('cityId', '')
                  addressValidation.setFieldValue('cityDistrictId', '')
                  addressValidation.setFieldValue('city', '')
                  addressValidation.setFieldValue('cityDistrict', '')
                }}
                error={addressValidation.touched.stateId && Boolean(addressValidation.errors.stateId)}
                maxAccess={maxAccess}
              />
            </FormGrid>
            <FormGrid hideonempty xs={12}>
              <ResourceLookup
                endpointId={SystemRepository.City.snapshot}
                parameters={{
                  _countryId: addressValidation.values.countryId,
                  _stateId: addressValidation.values.stateId ? addressValidation.values.stateId : 0
                }}
                valueField='name'
                displayField='name'
                name='city'
                required={required}
                label={labels.city}
                readOnly={(readOnly || !addressValidation.values.countryId) && true}
                form={addressValidation}
                secondDisplayField={false}
                onChange={(event, newValue) => {
                  addressValidation.setValues({
                    ...addressValidation.values,
                    cityId: newValue?.recordId || '',

                    city: newValue?.name || '',
                    cityDistrictId: '',
                    cityDistrict: ''
                  })
                }}
                errorCheck={'cityId'}
                maxAccess={maxAccess}
              />
            </FormGrid>
            <FormGrid hideonempty xs={12}>
              <ResourceLookup
                endpointId={SystemRepository.CityDistrict.snapshot}
                parameters={{
                  _cityId: addressValidation.values.cityId
                }}
                valueField='name'
                displayField='name'
                name='cityDistrict'
                label={labels.cityDistrict}
                readOnly={(readOnly || !addressValidation.values.cityId) && true}
                form={addressValidation}
                secondDisplayField={false}
                onChange={(event, newValue) => {
                  if (newValue) {
                    addressValidation.setFieldValue('cityDistrictId', newValue?.recordId)
                    addressValidation.setFieldValue('cityDistrict', newValue?.name)
                  } else {
                    addressValidation.setFieldValue('cityDistrictId', '')
                    addressValidation.setFieldValue('cityDistrict', '')
                  }
                }}
                errorCheck={'cityDistrictId'}
                maxAccess={maxAccess}
              />
            </FormGrid>
            <FormGrid hideonempty xs={12}>
              <CustomTextField
                name='name'
                label={labels.name}
                value={addressValidation.values.name}
                readOnly={readOnly}
                required={required}
                maxLength='20'
                onChange={addressValidation.handleChange}
                onClear={() => addressValidation.setFieldValue('name', '')}
                error={addressValidation.touched.name && Boolean(addressValidation.errors.name)}
                maxAccess={maxAccess}
              />
            </FormGrid>
            <FormGrid hideonempty xs={12}>
              <CustomTextField
                name='street1'
                label={labels.street1}
                value={addressValidation.values.street1}
                readOnly={readOnly}
                required={required}
                maxLength='20'
                onChange={addressValidation.handleChange}
                onClear={() => addressValidation.setFieldValue('street1', '')}
                error={addressValidation.touched.street1 && Boolean(addressValidation.errors.street1)}
                maxAccess={maxAccess}
              />
            </FormGrid>
            <FormGrid hideonempty xs={12}>
              <CustomTextField
                name='street2'
                label={labels.street2}
                value={addressValidation.values.street2}
                maxLength='20'
                readOnly={readOnly}
                onChange={addressValidation.handleChange}
                onClear={() => addressValidation.setFieldValue('street2', '')}
                error={addressValidation.touched.street2 && Boolean(addressValidation.errors.street2)}
                maxAccess={maxAccess}
              />
            </FormGrid>
            <FormGrid hideonempty xs={12}>
              <CustomTextField
                name='bldgNo'
                label={labels.bldgNo}
                value={addressValidation.values.bldgNo}
                maxLength='10'
                readOnly={readOnly}
                onChange={addressValidation.handleChange}
                onClear={() => addressValidation.setFieldValue('bldgNo', '')}
                error={addressValidation.touched.bldgNo && Boolean(addressValidation.errors.bldgNo)}
                maxAccess={maxAccess}
              />
            </FormGrid>
            <FormGrid hideonempty xs={12}>
              <CustomTextField
                name='unitNo'
                label={labels.unitNo}
                value={addressValidation.values.unitNo}
                maxLength='10'
                readOnly={readOnly}
                onChange={addressValidation.handleChange}
                onClear={() => addressValidation.setFieldValue('unitNo', '')}
                error={addressValidation.touched.unitNo && Boolean(addressValidation.errors.unitNo)}
                maxAccess={maxAccess}
              />
            </FormGrid>
            <FormGrid hideonempty xs={12}>
              <CustomTextField
                name='subNo'
                label={labels.subNo}
                value={addressValidation.values.subNo}
                maxLength='10'
                readOnly={readOnly}
                onChange={addressValidation.handleChange}
                onClear={() => addressValidation.setFieldValue('subNo', '')}
                error={addressValidation.touched.subNo && Boolean(addressValidation.errors.subNo)}
                maxAccess={maxAccess}
              />
            </FormGrid>
          </Grid>
        </Grow>
        <Grow>
          <Grid container gap={2}>
            <FormGrid hideonempty xs={12}>
              <CustomTextField
                name='postalCode'
                label={labels.postalCode}
                readOnly={readOnly}
                value={addressValidation.values.postalCode}
                onChange={addressValidation.handleChange}
                onClear={() => addressValidation.setFieldValue('postalCode', '')}
                error={addressValidation.touched.postalCode && Boolean(addressValidation.errors.postalCode)}
                maxAccess={maxAccess}
              />
            </FormGrid>

            <FormGrid hideonempty xs={12}>
              <CustomTextField
                name='phone'
                label={labels.phone}
                value={addressValidation.values.phone}
                readOnly={readOnly}
                maxLength='15'
                phone={true}
                onChange={addressValidation.handleChange}
                onClear={() => addressValidation.setFieldValue('phone', '')}
                error={addressValidation.touched.phone && Boolean(addressValidation.errors.phone)}
                maxAccess={maxAccess}
              />
            </FormGrid>

            <FormGrid hideonempty xs={12}>
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
                maxAccess={maxAccess}
              />
            </FormGrid>

            <FormGrid hideonempty xs={12}>
              <CustomTextField
                name='phone3'
                label={labels.phone3}
                value={addressValidation.values.phone3}
                maxLength='15'
                phone={true}
                readOnly={readOnly}
                onChange={addressValidation.handleChange}
                onClear={() => addressValidation.setFieldValue('phone3', '')}
                error={addressValidation.touched.phone3 && Boolean(addressValidation.errors.phone3)}
                maxAccess={maxAccess}
              />
            </FormGrid>
            <FormGrid hideonempty xs={12}>
              <CustomTextField
                name='email1'
                label={labels.email1}
                value={addressValidation.values.email1}
                type='email'
                onBlur={addressValidation.handleBlur}
                readOnly={readOnly}
                placeholder='johndoe@email.com'
                onChange={addressValidation.handleChange}
                onClear={() => addressValidation.setFieldValue('email1', '')}
                error={addressValidation.touched.email1 && Boolean(addressValidation.errors.email1)}
                maxAccess={maxAccess}
              />
            </FormGrid>
            <FormGrid hideonempty xs={12}>
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
                maxAccess={maxAccess}
              />
            </FormGrid>
            <FormGrid hideonempty xs={12}>
              <CustomTextField
                name='poBox'
                label={labels.poBox}
                value={addressValidation.values.poBox}
                maxLength='10'
                readOnly={readOnly}
                onChange={addressValidation.handleChange}
                onClear={() => addressValidation.setFieldValue('poBox', '')}
                error={addressValidation.touched.poBox && Boolean(addressValidation.errors.poBox)}
                maxAccess={maxAccess}
              />
            </FormGrid>
          </Grid>
        </Grow>
      </Grid>
    </VertLayout>
  )
}

export default AddressTab
