import { useFormik } from 'formik'
import { DISABLED, HIDDEN, MANDATORY } from 'src/services/api/maxAccess'
import * as yup from 'yup'

export function useForm({ maxAccess, validate = () => {}, ...formikProps }) {
  function explode(str) {
    const parts = str.split('.')

    return {
      gridName: parts[0] || '',
      fieldName: parts[1] || ''
    }
  }

  const dynamicValidationSchema = initialSchema => {
    if (!initialSchema) return yup.object()

    let updatedSchema = { ...initialSchema }

    ;(maxAccess?.record?.controls ?? []).forEach(control => {
      const { controlId, accessLevel } = control

      if (accessLevel === DISABLED || accessLevel === HIDDEN) {
        if (controlId?.indexOf('.') < 0) {
          const fieldDisable = updatedSchema?.fields[controlId]

          if (fieldDisable) {
            updatedSchema.fields[controlId] = fieldDisable.notRequired()
          }
        } else {
          const { gridName, fieldName } = explode(controlId)

          if (updatedSchema.fields[gridName] && updatedSchema?.fields?.[gridName]?.innerType?.fields?.[fieldName]) {
            updatedSchema.fields[gridName] = yup.array().of(
              yup.object().shape({
                ...updatedSchema?.fields?.[gridName]?.innerType?.fields,
                [fieldName]: yup.string().notRequired()
              })
            )
          }
        }
      }
    })

    return yup.object().shape(updatedSchema)
  }

  const formik = useFormik({
    ...formikProps,
    validate(values) {
      let maxAccessErrors = {}

      ;(maxAccess?.record?.controls ?? []).forEach(obj => {
        const { controlId, accessLevel } = obj
        if (accessLevel === MANDATORY)
          if (controlId?.indexOf('.') < 0) {
            const keys = Object.keys(formik.initialValues)
            if (!values[controlId] && keys?.indexOf(controlId) > -1)
              maxAccessErrors = {
                ...maxAccessErrors,
                [controlId]: `${controlId} is required.`
              }
          } else {
            const { gridName, fieldName } = explode(controlId)

            if (Array.isArray(values?.[gridName])) {
              ;(values?.[gridName] || [])?.forEach((row, index) => {
                if (!maxAccessErrors[gridName]) {
                  maxAccessErrors[gridName] = []
                }
            if (Array.isArray(values?.[gridName])) {
              ;(values?.[gridName] || [])?.forEach((row, index) => {
                if (!maxAccessErrors[gridName]) {
                  maxAccessErrors[gridName] = []
                }

                if (!maxAccessErrors[gridName][index]) {
                  maxAccessErrors[gridName][index] = {}
                }
                if (!maxAccessErrors[gridName][index]) {
                  maxAccessErrors[gridName][index] = {}
                }

                if (!row[fieldName] || row[fieldName] == 0) {
                  maxAccessErrors[gridName][index][fieldName] = `${fieldName} is required.`
                } else {
                  if (maxAccessErrors[gridName][index][fieldName]) delete maxAccessErrors[gridName][index][fieldName]
                if (!row[fieldName] || row[fieldName] == 0) {
                  maxAccessErrors[gridName][index][fieldName] = `${fieldName} is required.`
                } else {
                  if (maxAccessErrors[gridName][index][fieldName]) delete maxAccessErrors[gridName][index][fieldName]

                  if (Object.keys(maxAccessErrors[gridName][index])?.length === 0) {
                    delete maxAccessErrors[gridName][index]
                  }
                }
                  if (Object.keys(maxAccessErrors[gridName][index])?.length === 0) {
                    delete maxAccessErrors[gridName][index]
                  }
                }

                if (maxAccessErrors[gridName]?.every(obj => Object.keys(obj)?.length === 0)) {
                  delete maxAccessErrors[gridName]
                }
              })
            } else {
              if (!maxAccessErrors[gridName]) {
                maxAccessErrors[gridName] = {}
              }

              if (
                !maxAccessErrors[gridName][fieldName] &&
                !formik.values[gridName][fieldName] &&
                formik.values[gridName][fieldName] != 0
              ) {
                maxAccessErrors[gridName][fieldName] = `${fieldName} is required.`
              }

              if (maxAccessErrors[gridName] && Object.keys(maxAccessErrors[gridName]).length === 0) {
                delete maxAccessErrors[gridName]
              }
            }
          }
      })

      return {
        ...maxAccessErrors,
        ...validate(values)
      }
    }
  })

  formik.validationSchema, dynamicValidationSchema(formikProps?.validationSchema)

  return { formik }
}
