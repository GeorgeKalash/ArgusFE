import React, { useState, useEffect } from 'react'
import FormShell from './FormShell'
import AddressTab from './AddressTab'
import { useForm } from 'src/hooks/form'
import { VertLayout } from './Layouts/VertLayout'
import { Grow } from './Layouts/Grow'
import useResourceParams from 'src/hooks/useResourceParams'
import { ResourceIds } from 'src/resources/ResourceIds'

export const AddressFormShell = ({
  setAddress,
  address,
  editMode,
  window,
  readOnly,
  allowPost,
  optional = false,
  addressValidation,
  onSubmit,
  isSavedClear = true,
  isCleared = true,
  isForm = true,
  ...props
}) => {
  const [required, setRequired] = useState(!optional)

  const { access: maxAccess } = useResourceParams({
    datasetId: ResourceIds.Address
  })

  const initialValues = addressValidation.values || {
    recordId: address?.recordId || null,
    name: address?.name || '',
    countryId: address?.countryId || '',
    countryName: address?.countryName || '',
    stateId: address?.stateId || '',
    stateName: address?.stateName || '',
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
    subNo: address?.subNo || '',
    poBox: address?.poBox || ''
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
        ((values.name || values.cityId || values.phone || values.countryId || values.street1) && optional) ||
        !optional
      ) {
        // if (!values.name) {
        //   errors.name = ' '
        // }
        if (!values.street1) {
          errors.street1 = ' '
        }
        if (!values.countryId) {
          errors.countryId = ' '
        }
        if (!values.cityId) {
          errors.cityId = ' '
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
      }
      window.close()
    }
  })

  useEffect(() => {
    if (optional && (formik.values.name || formik.values.street1 || formik.values.countryId || formik.values.cityId)) {
      setRequired(true)
    }
    if (
      optional &&
      !formik.values.name &&
      !formik.values.street1 &&
      !formik.values.countryId &&
      !formik.values.cityId
    ) {
      setRequired(false)
    }
  }, [formik.values])

  return isForm ? (
    <FormShell
      form={formik}
      maxAccess={maxAccess}
      infoVisible={false}
      disabledSubmit={readOnly}
      editMode={editMode}
      isSavedClear={isSavedClear}
      isCleared={isCleared}
      {...props}
    >
      <VertLayout>
        <Grow>
          <AddressTab addressForm={formik} readOnly={readOnly} required={required} {...props} />
        </Grow>
      </VertLayout>
    </FormShell>
  ) : (
    <AddressTab addressForm={formik} readOnly={readOnly} required={required} {...props} />
  )
}
