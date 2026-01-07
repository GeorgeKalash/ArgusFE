import { useContext, useEffect, useMemo, useRef } from 'react'
import CustomTextField from '@argus/shared-ui/src/components/Inputs/CustomTextField'
import ResourceComboBox from './ResourceComboBox'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { ResourceLookup } from './ResourceLookup'
import FormGrid from '@argus/shared-ui/src/components/form'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import * as yup from 'yup'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'

const AddressTab = ({
  address,
  addressValidation,
  readOnly = false,
  defaultReadOnly = {},
  required = true,
  setFormik,
  access,
  ...props
}) => {
  const { getRequest } = useContext(RequestsContext)

  const { labels, access: maxAccess } = useResourceParams({
    datasetId: ResourceIds.Address,
    DatasetIdAccess: props?.datasetId
  })

  const lastRecordIdRef = useRef(null)

  const initialValues = useMemo(
    () => ({
      recordId: address?.recordId || null,
      name: address?.name || '',
      countryId: address?.countryId || null,
      countryName: address?.countryName || '',
      stateId: address?.stateId || null,
      stateName: address?.stateName || '',
      cityId: address?.cityId || null,
      city: address?.city || '',
      street1: address?.street1 || '',
      street2: address?.street2 || '',
      email1: address?.email1 || '',
      email2: address?.email2 || '',
      phone: address?.phone || '',
      phone2: address?.phone2 || '',
      phone3: address?.phone3 || '',
      addressId: address?.addressId || null,
      postalCode: address?.postalCode || '',
      cityDistrictId: address?.cityDistrictId || null,
      cityDistrict: address?.cityDistrict || '',
      bldgNo: address?.bldgNo || '',
      unitNo: address?.unitNo || '',
      subNo: address?.subNo || '',
      poBox: address?.poBox || ''
    }),
    [address]
  )

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const requiredFields = (maxAccess?.record?.controls || [])
    .filter(control => control.accessLevel === 2)
    .map(control => control.controlId)

  const options =
    ((addressValidation.values.name ||
      addressValidation.values.cityId ||
      addressValidation.values.phone ||
      addressValidation.values.countryId ||
      addressValidation.values.street1 ||
      requiredFields.some(field => !!addressValidation.values[field])) &&
      !required) ||
    required

  const validate = options && {
    name: yup.string().required(),
    street1: yup.string().required(),
    phone: yup.string().required(),
    countryId: yup.number().required(),
    city: yup.string().required(),
    email1: yup.string().nullable().matches(emailRegex, { message: 'Invalid email format', excludeEmptyString: true }),
    email2: yup.string().nullable().matches(emailRegex, { message: 'Invalid email format', excludeEmptyString: true })
  }
  useEffect(() => {
    if (address?.recordId !== lastRecordIdRef.current) {
      lastRecordIdRef.current = address?.recordId

      Object.entries(initialValues).forEach(([key, value]) => {
        addressValidation.setFieldValue(key, value, false)
      })
    }
  }, [address?.recordId])

  useEffect(() => {
    if (!address?.recordId) {
      const hasAddressData = address && Object.values(address).some(val => val !== null && val !== '')

      if (hasAddressData && address !== lastRecordIdRef.current) {
        lastRecordIdRef.current = address

        Object.entries(initialValues).forEach(([key, value]) => {
          addressValidation.setFieldValue(key, value, false)
        })
      }
    }
  }, [address])

  useEffect(() => {
    if (maxAccess) {
      const filteredControls = options
        ? maxAccess?.record?.controls || []
        : (maxAccess?.record?.controls || []).filter(control => control.accessLevel !== 2)

      setFormik({
        validate,
        maxAccess: access
          ? {
              ...access,
              record: {
                ...access?.record,
                controls: [...(access?.record?.controls || []), ...filteredControls]
              }
            }
          : {
              ...maxAccess,
              record: {
                ...maxAccess.record,
                controls: filteredControls
              }
            }
      })
    }
  }, [maxAccess, options])

  useEffect(() => {
    async function getCountry() {
      const res = await getRequest({
        extension: SystemRepository.Defaults.get,
        parameters: `_filter=&_key=countryId`
      })
      const countryId = res.record.value
      if (!addressValidation.values.countryId) {
        addressValidation.setFieldValue('countryId', parseInt(countryId))
      }
    }

    getCountry()
  }, [])

  return (
    <FormGrid container hideonempty xs={12} spacing={2}>
      <FormGrid item hideonempty xs={12}>
        <CustomTextField
          name='name'
          label={labels.name}
          value={addressValidation.values.name}
          readOnly={readOnly}
          maxLength='50'
          required={required}
          onChange={addressValidation.handleChange}
          onClear={() => addressValidation.setFieldValue('name', '')}
          error={addressValidation.touched?.name && Boolean(addressValidation.errors?.name)}
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
          displayFieldWidth={1.5}
          required={required}
          columnsInDropDown={[
            { key: 'reference', value: 'Reference' },
            { key: 'name', value: 'Name' },
            { key: 'flName', value: 'Foreign Language Name' }
          ]}
          values={addressValidation.values}
          onChange={(event, newValue) => {
            addressValidation.setFieldValue('stateId', null)
            addressValidation.setFieldValue('cityId', null)
            addressValidation.setFieldValue('city', '')
            addressValidation.setFieldValue('cityDistrictId', null)
            addressValidation.setFieldValue('cityDistrict', '')
            if (newValue) {
              addressValidation.setFieldValue('countryId', newValue?.recordId)
              addressValidation.setFieldValue('countryName', newValue?.name)
            } else {
              addressValidation.setFieldValue('countryId', null)
              addressValidation.setFieldValue('countryName', '')
            }
          }}
          error={addressValidation.touched.countryId && Boolean(addressValidation.errors.countryId)}
          maxAccess={maxAccess}
        />
      </FormGrid>
      <FormGrid item hideonempty xs={4}>
        <ResourceComboBox
          endpointId={addressValidation.values.countryId && SystemRepository.State.qry}
          parameters={addressValidation.values.countryId && `_countryId=${addressValidation.values.countryId || 0}`}
          name='stateId'
          label={labels.state}
          valueField='recordId'
          displayField='name'
          readOnly={readOnly || !addressValidation.values?.countryId}
          values={addressValidation.values}
          onChange={(event, newValue) => {
            addressValidation.setFieldValue('stateId', newValue?.recordId || null)
            addressValidation.setFieldValue('stateName', newValue?.name || '')
            addressValidation.setFieldValue('cityId', null)
            addressValidation.setFieldValue('cityDistrictId', null)
            addressValidation.setFieldValue('city', '')
            addressValidation.setFieldValue('cityDistrict', '')
          }}
          error={addressValidation.touched.stateId && Boolean(addressValidation.errors.stateId)}
          maxAccess={maxAccess}
        />
      </FormGrid>
      <FormGrid item hideonempty xs={4}>
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
          readOnly={readOnly || !addressValidation.values.countryId}
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
          errorCheck={'city'}
          maxAccess={maxAccess}
        />
      </FormGrid>
      <FormGrid item hideonempty xs={4}>
        <ResourceLookup
          endpointId={addressValidation.values.cityId && SystemRepository.CityDistrict.snapshot}
          parameters={
            addressValidation.values.cityId && {
              _cityId: addressValidation.values.cityId
            }
          }
          valueField='name'
          displayField='name'
          name='cityDistrictId'
          label={labels.cityDistrict}
          readOnly={readOnly || !addressValidation.values.cityId}
          form={addressValidation}
          secondDisplayField={false}
          valueShow='cityDistrict'
          onChange={(event, newValue) => {
            if (newValue) {
              addressValidation.setFieldValue('cityDistrictId', newValue?.recordId)
              addressValidation.setFieldValue('cityDistrict', newValue?.name)
            } else {
              addressValidation.setFieldValue('cityDistrictId', null)
              addressValidation.setFieldValue('cityDistrict', '')
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
              value={addressValidation.values.street1}
              required={required}
              readOnly={readOnly}
              maxLength='100'
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('street1', '')}
              error={addressValidation.touched.street1 && Boolean(addressValidation.errors.street1)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid item hideonempty xs={6}>
            <CustomTextField
              name='street2'
              label={labels.street2}
              value={addressValidation.values.street2}
              maxLength='100'
              readOnly={readOnly}
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('street2', '')}
              error={addressValidation.touched.street2 && Boolean(addressValidation.errors.street2)}
              maxAccess={maxAccess}
            />
          </FormGrid>
        </FormGrid>
      </FormGrid>
      <FormGrid item hideonempty xs={4}>
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
      <FormGrid item hideonempty xs={4}>
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
      <FormGrid item hideonempty xs={4}>
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
      <FormGrid item hideonempty xs={4}>
        <CustomTextField
          name='postalCode'
          maxLength='5'
          label={labels.postalCode}
          readOnly={readOnly}
          value={addressValidation.values.postalCode}
          onChange={addressValidation.handleChange}
          onClear={() => addressValidation.setFieldValue('postalCode', '')}
          error={addressValidation.touched.postalCode && Boolean(addressValidation.errors.postalCode)}
          maxAccess={maxAccess}
        />
      </FormGrid>
      <FormGrid item hideonempty xs={4}>
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
      <FormGrid item hideonempty xs={12}>
        <FormGrid container hideonempty spacing={2}>
          <FormGrid item hideonempty xs={4}>
            <CustomTextField
              name='phone'
              label={labels.phone}
              value={addressValidation.values.phone}
              readOnly={readOnly}
              maxLength='40'
              required={required}
              phone={true}
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('phone', '')}
              error={addressValidation.touched.phone && Boolean(addressValidation.errors.phone)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid item hideonempty xs={4}>
            <CustomTextField
              name='phone2'
              label={labels.phone2}
              value={addressValidation.values.phone2}
              maxLength='40'
              phone={true}
              readOnly={readOnly}
              onChange={addressValidation.handleChange}
              onClear={() => addressValidation.setFieldValue('phone2', '')}
              error={addressValidation.touched.phone2 && Boolean(addressValidation.errors.phone2)}
              maxAccess={maxAccess}
            />
          </FormGrid>
          <FormGrid item hideonempty xs={4}>
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
        </FormGrid>
      </FormGrid>
      <FormGrid item hideonempty xs={12}>
        <FormGrid container hideonempty spacing={2}>
          <FormGrid item hideonempty xs={6}>
            <CustomTextField
              name='email1'
              maxLength='50'
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
          <FormGrid item hideonempty xs={6}>
            <CustomTextField
              name='email2'
              type='email'
              maxLength='50'
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
        </FormGrid>
      </FormGrid>
    </FormGrid>
  )
}

export default AddressTab
