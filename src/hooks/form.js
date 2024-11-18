import { useFormik } from 'formik'
import { MANDATORY } from 'src/services/api/maxAccess'

export function useForm({ maxAccess, validate = () => {}, ...formikProps }) {
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

      return {
        ...maxAccessErrors,
        ...validate(values)
      }
    }
  })

  return { formik }
}
