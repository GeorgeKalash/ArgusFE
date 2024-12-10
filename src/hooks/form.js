import { useFormik } from 'formik'
import { useEffect, useState } from 'react'
import { MANDATORY } from 'src/services/api/maxAccess'

export function useForm({ maxAccess, validate = () => {}, ...formikProps }) {
  const [debounceTimeout, setDebounceTimeout] = useState(null)

  const formik = useFormik({
    ...formikProps,
    validate(values) {
      let maxAccessErrors = {}

      ;(maxAccess?.record?.controls ?? []).forEach(obj => {
        const { controlId, accessLevel } = obj

        if (accessLevel === MANDATORY) {
          if (!values[controlId])
            maxAccessErrors = {
              ...maxAccessErrors,
              [controlId]: `${controlId} is required.`
            }
        }
      })

      return {
        ...maxAccessErrors,
        ...validate(values)
      }
    },
    validateOnChange: false
  })

  useEffect(() => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout)
    }

    const timeout = setTimeout(() => {
      formik.validateForm(formik.values)
    }, 400)

    setDebounceTimeout(timeout)

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [formik.values])

  return { formik }
}
