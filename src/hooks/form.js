import { useFormik } from 'formik'
import { useState } from 'react'
import { MANDATORY } from 'src/services/api/maxAccess'

export function useForm({ maxAccess, validate = () => {}, ...formikProps }) {
  const [Validation, setValidation] = useState()

  const setFieldValidation = (field, errors) => {
    setValidation(prev => {
      const updatedValidation = { ...prev }
      if (errors === '') {
        delete updatedValidation[field]
      } else {
        updatedValidation[field] = errors
      }

      return updatedValidation
    })
  }

  const formik = useFormik({
    ...formikProps,
    validate(values) {
      let maxAccessErrors = {}

      ;(maxAccess?.record?.controls ?? []).forEach(obj => {
        const { controlId, accessLevel } = obj

        console.log(controlId, accessLevel, values)

        if (accessLevel === MANDATORY) {
          if (!values[controlId])
            maxAccessErrors = {
              ...maxAccessErrors,
              [controlId]: `${controlId} is required.`
            }
        }
      })

      const mergedValidation = Validation

      return {
        ...maxAccessErrors,
        ...mergedValidation,
        ...validate(values)
      }
    }
  })

  return { formik, setFieldValidation }
}
