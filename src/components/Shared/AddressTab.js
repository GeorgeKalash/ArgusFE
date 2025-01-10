import CustomTextField from 'src/components/Inputs/CustomTextField'
import ResourceComboBox from './ResourceComboBox'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { ResourceLookup } from './ResourceLookup'
import FormGrid from 'src/components/form/layout/FormGrid'
import useResourceParams from 'src/hooks/useResourceParams'
import { ResourceIds } from 'src/resources/ResourceIds'
import { useContext, useEffect } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'

const AddressTab = ({ addressForm, readOnly = false, required = true, defaultReadOnly = {} }) => {
  const { labels: labels, access: maxAccess } = useResourceParams({
    datasetId: ResourceIds.Address
  })

  const { getRequest } = useContext(RequestsContext)

  useEffect(() => {
    async function getCountry() {
      var parameters = `_filter=&_key=countryId`

      const res = await getRequest({
        extension: SystemRepository.Defaults.get,
        parameters: parameters
      })
      const countryId = res.record.value

      addressForm.setFieldValue('countryId', parseInt(countryId))
    }

    getCountry()
  }, [])

  return (
    <FormGrid container hideonempty xs={12} spacing={2}>
      <FormGrid item hideonempty xs={12}>
        <CustomTextField
          name='name'
          label={labels.name}
          value={addressForm.values.name}
          readOnly={readOnly}
          required={required}
          maxLength='20'
          onChaneg={addressForm.handleChange}
          onClear={() => addressForm.setFieldValue('name', '')}
          error={addressForm.touched.name && Boolean(addressForm.errors.name)}
          maxAccess={maxAccess}
        />
      </FormGrid>
      <FormGrid item hideonempty xs={4}>
        <ResourceComboBox
          endpointId={SystemRepository.Country.qry}
          name='countryId'
          label={labels.country}
          valueField='recordId'
          displayField={['reference', 'name']}
          readOnly={readOnly || defaultReadOnly?.countryId}
          required={required}
          displayFieldWidth={1.5}
          columnsInDropDown={[
            { key: 'reference', value: 'Reference' },
            { key: 'name', value: 'Name' },
            { key: 'flName', value: 'Foreign Language Name' }
          ]}
          values={addressForm.values}
          onChange={(event, newValue) => {
            addressForm.setFieldValue('stateId', null)
            addressForm.setFieldValue('cityId', '')
            addressForm.setFieldValue('city', '')
            addressForm.setFieldValue('cityDistrictId', '')
            addressForm.setFieldValue('cityDistrict', '')
            if (newValue) {
              addressForm.setFieldValue('countryId', newValue?.recordId)
              addressForm.setFieldValue('countryName', newValue?.name)
            } else {
              addressForm.setFieldValue('countryId', '')
              addressForm.setFieldValue('countryName', '')
            }
          }}
          error={addressForm.touched.countryId && Boolean(addressForm.errors.countryId)}
          maxAccess={maxAccess}
        />
      </FormGrid>
      <FormGrid item hideonempty xs={4}>
        <ResourceComboBox
          endpointId={addressForm.values.countryId && SystemRepository.State.qry}
          parameters={addressForm.values.countryId && `_countryId=${addressForm.values.countryId || 0}`}
          name='stateId'
          label={labels.state}
          valueField='recordId'
          displayField='name'
          readOnly={(readOnly || !addressForm.values.countryId) && true}
          values={addressForm.values}
          onChange={(event, newValue) => {
            addressForm.setFieldValue('stateId', newValue?.recordId)
            addressForm.setFieldValue('stateName', newValue?.name)
            addressForm.setFieldValue('cityId', '')
            addressForm.setFieldValue('cityDistrictId', '')
            addressForm.setFieldValue('city', '')
            addressForm.setFieldValue('cityDistrict', '')
          }}
          error={addressForm.touched.stateId && Boolean(addressForm.errors.stateId)}
          maxAccess={maxAccess}
        />
      </FormGrid>
      <FormGrid item hideonempty xs={4}>
        <ResourceLookup
          endpointId={SystemRepository.City.snapshot}
          parameters={{
            _countryId: addressForm.values.countryId,
            _stateId: addressForm.values.stateId ? addressForm.values.stateId : 0
          }}
          valueField='name'
          displayField='name'
          name='city'
          required={required}
          label={labels.city}
          readOnly={(readOnly || !addressForm.values.countryId) && true}
          form={addressForm}
          secondDisplayField={false}
          onChange={(event, newValue) => {
            addressForm.setValues({
              ...addressForm.values,
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
      <FormGrid item hideonempty xs={4}>
        <ResourceLookup
          endpointId={SystemRepository.CityDistrict.snapshot}
          parameters={{
            _cityId: addressForm.values.cityId
          }}
          valueField='name'
          displayField='name'
          name='cityDistrict'
          label={labels.cityDistrict}
          readOnly={(readOnly || !addressForm.values.cityId) && true}
          form={addressForm}
          secondDisplayField={false}
          onChange={(event, newValue) => {
            if (newValue) {
              addressForm.setFieldValue('cityDistrictId', newValue?.recordId)
              addressForm.setFieldValue('cityDistrict', newValue?.name)
            } else {
              addressForm.setFieldValue('cityDistrictId', '')
              addressForm.setFieldValue('cityDistrict', '')
            }
          }}
          errorCheck={'cityDistrictId'}
          maxAccess={maxAccess}
        />
      </FormGrid>
      <FormGrid item hideonempty xs={12}>
        <FormGrid container hideonempty spacing={2}>
          <FormGrid item hideonempty xs={6}>
            <CustomTextField
              name='street1'
              label={labels.street1}
              value={addressForm.values.street1}
              readOnly={readOnly}
              required={required}
              maxLength='20'
              onChaneg={addressForm.handleChange}
              onClear={() => addressForm.setFieldValue('street1', '')}
              error={addressForm.touched.street1 && Boolean(addressForm.errors.street1)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid item hideonempty xs={6}>
            <CustomTextField
              name='street2'
              label={labels.street2}
              value={addressForm.values.street2}
              maxLength='20'
              readOnly={readOnly}
              onChaneg={addressForm.handleChange}
              onClear={() => addressForm.setFieldValue('street2', '')}
              error={addressForm.touched.street2 && Boolean(addressForm.errors.street2)}
              maxAccess={maxAccess}
            />
          </FormGrid>
        </FormGrid>
      </FormGrid>
      <FormGrid item hideonempty xs={4}>
        <CustomTextField
          name='bldgNo'
          label={labels.bldgNo}
          value={addressForm.values.bldgNo}
          maxLength='10'
          readOnly={readOnly}
          onChaneg={addressForm.handleChange}
          onClear={() => addressForm.setFieldValue('bldgNo', '')}
          error={addressForm.touched.bldgNo && Boolean(addressForm.errors.bldgNo)}
          maxAccess={maxAccess}
        />
      </FormGrid>
      <FormGrid item hideonempty xs={4}>
        <CustomTextField
          name='unitNo'
          label={labels.unitNo}
          value={addressForm.values.unitNo}
          maxLength='10'
          readOnly={readOnly}
          onChaneg={addressForm.handleChange}
          onClear={() => addressForm.setFieldValue('unitNo', '')}
          error={addressForm.touched.unitNo && Boolean(addressForm.errors.unitNo)}
          maxAccess={maxAccess}
        />
      </FormGrid>
      <FormGrid item hideonempty xs={4}>
        <CustomTextField
          name='subNo'
          label={labels.subNo}
          value={addressForm.values.subNo}
          maxLength='10'
          readOnly={readOnly}
          onChaneg={addressForm.handleChange}
          onClear={() => addressForm.setFieldValue('subNo', '')}
          error={addressForm.touched.subNo && Boolean(addressForm.errors.subNo)}
          maxAccess={maxAccess}
        />
      </FormGrid>
      <FormGrid item hideonempty xs={4}>
        <CustomTextField
          name='postalCode'
          label={labels.postalCode}
          readOnly={readOnly}
          value={addressForm.values.postalCode}
          onChaneg={addressForm.handleChange}
          onClear={() => addressForm.setFieldValue('postalCode', '')}
          error={addressForm.touched.postalCode && Boolean(addressForm.errors.postalCode)}
          maxAccess={maxAccess}
        />
      </FormGrid>
      <FormGrid item hideonempty xs={4}>
        <CustomTextField
          name='poBox'
          label={labels.poBox}
          value={addressForm.values.poBox}
          maxLength='10'
          readOnly={readOnly}
          onChaneg={addressForm.handleChange}
          onClear={() => addressForm.setFieldValue('poBox', '')}
          error={addressForm.touched.poBox && Boolean(addressForm.errors.poBox)}
          maxAccess={maxAccess}
        />
      </FormGrid>
      <FormGrid item hideonempty xs={12}>
        <FormGrid container hideonempty spacing={2}>
          <FormGrid item hideonempty xs={4}>
            <CustomTextField
              name='phone'
              label={labels.phone}
              value={addressForm.values.phone}
              readOnly={readOnly}
              maxLength='15'
              phone={true}
              onChaneg={addressForm.handleChange}
              onClear={() => addressForm.setFieldValue('phone', '')}
              error={addressForm.touched.phone && Boolean(addressForm.errors.phone)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid item hideonempty xs={4}>
            <CustomTextField
              name='phone2'
              label={labels.phone2}
              value={addressForm.values.phone2}
              maxLength='15'
              phone={true}
              readOnly={readOnly}
              onChaneg={addressForm.handleChange}
              onClear={() => addressForm.setFieldValue('phone2', '')}
              error={addressForm.touched.phone2 && Boolean(addressForm.errors.phone2)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid item hideonempty xs={4}>
            <CustomTextField
              name='phone3'
              label={labels.phone3}
              value={addressForm.values.phone3}
              maxLength='15'
              phone={true}
              readOnly={readOnly}
              onChaneg={addressForm.handleChange}
              onClear={() => addressForm.setFieldValue('phone3', '')}
              error={addressForm.touched.phone3 && Boolean(addressForm.errors.phone3)}
              maxAccess={maxAccess}
            />
          </FormGrid>
        </FormGrid>
      </FormGrid>
      <FormGrid item hideonempty xs={12}>
        <FormGrid container hideonempty spacing={2}>
          <FormGrid item hideonempty xs={6}>
            <CustomTextField
              name='email1'
              label={labels.email1}
              value={addressForm.values.email1}
              type='email'
              onBlur={addressForm.handleBlur}
              readOnly={readOnly}
              placeholder='johndoe@email.com'
              onChaneg={addressForm.handleChange}
              onClear={() => addressForm.setFieldValue('email1', '')}
              error={addressForm.touched.email1 && Boolean(addressForm.errors.email1)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid item hideonempty xs={6}>
            <CustomTextField
              name='email2'
              type='email'
              readOnly={readOnly}
              placeholder='johndoe@email.com'
              label={labels.email2}
              onBlur={addressForm.handleBlur}
              value={addressForm.values.email2}
              onChaneg={addressForm.handleChange}
              onClear={() => addressForm.setFieldValue('email2', '')}
              error={addressForm.touched.email2 && Boolean(addressForm.errors.email2)}
              maxAccess={maxAccess}
            />
          </FormGrid>
        </FormGrid>
      </FormGrid>
    </FormGrid>
  )
}

export default AddressTab
