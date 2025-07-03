import React, { useState, useEffect } from 'react'
import FormShell from './FormShell'
import AddressTab from './AddressTab'
import { useForm } from 'src/hooks/form'
import { VertLayout } from './Layouts/VertLayout'
import { Fixed } from './Layouts/Fixed'
import * as yup from 'yup'

export const AddressFormShell = ({
  setAddress,
  address,
  editMode,
  window,
  readOnly,
  allowPost,
  optional = false,
  onSubmit,
  isSavedClear = true,
  isCleared = true,
  actions,
  ...props
}) => {
  const [required, setRequired] = useState(!optional)
  const [formikSettings, setFormik] = useState({})

  const { formik, setFieldValidation } = useForm({
    maxAccess: formikSettings.maxAccess,
    initialValues: {},
    validateOnChange: true,
    validateOnBlur: true,
    validationSchema: yup.object({
      ...formikSettings.validate
    }),
    onSubmit: values => {
      setAddress(values)
      if (allowPost) {
        onSubmit(values, window)
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
      infoVisible={false}
      disabledSubmit={readOnly}
      editMode={editMode}
      isSavedClear={isSavedClear}
      isCleared={isCleared}
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
            optional={optional}
            address={address}
            setFieldValidation={setFieldValidation}
            {...props}
          />
        </Fixed>
      </VertLayout>
    </FormShell>
  )
}
