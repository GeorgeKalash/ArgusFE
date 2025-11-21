import React, { useState, useEffect } from 'react'
import FormShell from './FormShell'
import AddressTab from './AddressTab'
import { useForm } from '@argus/shared-hooks/src/hooks/form'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import * as yup from 'yup'

export const AddressFormShell = ({
  setAddress,
  address,
  editMode,
  window,
  readOnly,
  allowPost = true,
  optional = false,
  onSubmit,
  isSavedClear = true,
  isCleared = true,
  changeClear = false,
  actions = [],
  ...props
}) => {
  const [required, setRequired] = useState(!optional)
  const [formikSettings, setFormik] = useState({})

  const { formik } = useForm({
    maxAccess: formikSettings.maxAccess,
    initialValues: {
      recordId: null,
      name: '',
      countryId: null,
      countryName: '',
      stateId: null,
      stateName: '',
      cityId: null,
      city: '',
      street1: '',
      street2: '',
      email1: '',
      email2: '',
      phone: '',
      phone2: '',
      phone3: '',
      addressId: null,
      postalCode: '',
      cityDistrictId: null,
      cityDistrict: '',
      bldgNo: '',
      unitNo: '',
      subNo: '',
      poBox: ''
    },
    validateOnChange: true,
    validateOnBlur: true,
    validationSchema: yup.object({
      ...formikSettings.validate
    }),
    onSubmit: values => {
      setAddress(values)
      if (allowPost) {
        onSubmit(values, window)
      } else {
        window.close()
      }
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

  return (
    <FormShell
      form={formik}
      maxAccess={formikSettings.maxAccess}
      isInfo={false}
      disabledSubmit={readOnly}
      editMode={editMode}
      isSavedClear={isSavedClear}
      isCleared={isCleared}
      onClear={
        changeClear
          ? () => {
              formik.resetForm({
                values: formik.initialValues
              })
            }
          : undefined
      }
      actions={actions}
      {...props}
    >
      <VertLayout>
        <Fixed>
          <AddressTab
            addressValidation={formik}
            readOnly={readOnly}
            required={required}
            setFormik={setFormik}
            address={address}
            {...props}
          />
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
