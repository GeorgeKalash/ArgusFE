import React, { useState, useEffect } from 'react'
import FormShell from './FormShell'
import AddressTab from './AddressTab'
import { useFormik } from 'formik'
import { useForm } from 'src/hooks/form'
import useResourceParams from 'src/hooks/useResourceParams'
import { ResourceIds } from 'src/resources/ResourceIds'

export const AddressFormShell = ({
  setAddress,
  address,
  maxAccess,
  editMode,
  window,
  readOnly,
  allowPost,
  requiredOptional = false,
  onSubmit
}) => {
  const [required, setRequired] = useState(false)

  const { labels: labels, access } = useResourceParams({
    datasetId: ResourceIds.Address
  })

  const initialValues = {
    recordId: address?.recordId || null,
    name: address?.name || '',
    countryId: address?.countryId || '',
    stateId: address?.stateId || '',
    cityId: address?.cityId || '',
    city: address?.city || '',
    street1: address?.street1 || '',
    street2: address?.street2 || '',
    email1: address?.email1 || '',
    email2: address?.email2 || '',
    phone: address?.phone || '',
    phone2: address?.phone2 || '',
    phone3: address?.phone3 || '',
    addressId: address?.addressId || '',
    postalCode: address?.postalCode || '',
    cityDistrictId: address?.cityDistrictId || '',
    cityDistrict: address?.cityDistrict || '',
    bldgNo: address?.bldgNo || '',
    unitNo: address?.unitNo || '',
    subNo: address?.subNo || ''
  }

  const { formik } = useForm({
    maxAccess,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    validate: values => {
      const errors = {}
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (
        ((values.name || values.cityId || values.phone || values.countryId || values.street1) && requiredOptional) ||
        !requiredOptional
      ) {
        if (!values.name) {
          errors.name = ' '
        }
        if (!values.street1) {
          errors.street1 = ' '
        }
        if (!values.countryId) {
          errors.countryId = ' '
        }
        if (!values.cityId) {
          errors.cityId = ' '
        }
        if (!values.phone) {
          errors.phone = ' '
        }
      }
      if (values.email1 && !emailRegex?.test(values?.email1)) {
        errors.email1 = 'Invalid email format'
      }

      if (values.email2 && !emailRegex?.test(values?.email2)) {
        errors.email2 = 'Invalid email format'
      }

      return errors
    },
    initialValues,
    onSubmit: values => {
      setAddress(values)

      if (allowPost) {
        onSubmit(values)
      } else {
        window.close()
      }
    }
  })

  return (
    <FormShell form={formik} maxAccess={maxAccess} infoVisible={false} readOnly={readOnly} editMode={editMode}>
      <AddressTab
        addressValidation={formik}
        maxAccess={access}
        labels={labels}
        required={required}
        readOnly={readOnly}
      />
    </FormShell>
  )
}
