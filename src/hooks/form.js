import { useFormik } from 'formik'
import { useEffect, useState } from 'react'
import { DISABLED, HIDDEN, MANDATORY } from 'src/services/api/maxAccess'
import * as yup from 'yup'

export function useForm({
  allowNoLines,
  documentType = {},
  conditionSchema = [],
  maxAccess,
  validate = () => {},
  ...formikProps
}) {
  const [validation, setFieldValidation] = useState({})

  function explode(str) {
    const parts = str.split('.')

    return {
      gridName: parts[0] || '',
      fieldName: parts[1] || ''
    }
  }

  function getValueByPath(obj, path) {
    return path.split('.').reduce((o, key) => (o ? o[key] : undefined), obj)
  }

  function filterRowsWithEmptyRequiredFields(rows) {
    return rows.filter(row =>
      Object.entries(validation).some(([fieldPath, rule]) => {
        if (!rule?.required) return false
        const value = getValueByPath(row, fieldPath)

        return value === '' || value === null || value === undefined
      })
    )
  }

  const checkValidation = (field, value, rule) => {
    let result = ''

    if (rule.required && (value === '' || value == null)) {
      result = `${field} is required.`
    } else {
      if (value != '' && value != null && rule.minLength != null && value.length < rule.minLength) {
        result = `${field} must be at least ${rule.minLength} characters`
      }

      if (value != '' && value != null && rule.maxValue != null && value > rule.maxValue) {
        result = `${field} value must less than ${rule.maxValue}`
      }
      if (value != '' && value != null && rule.minValue != null && value < rule.minValue) {
        result = `${field} value must be more than  ${rule.minValue}`
      }
    }

    return result
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

      const rules = validation || {}

      Object.keys(rules).forEach(field => {
        const value = values[field]
        const rule = rules[field]
        if (field?.indexOf('.') < 0) {
          const error = checkValidation(field, value, rule)
          if (error) maxAccessErrors[field] = checkValidation(field, value, rule)
        } else {
          const { gridName, fieldName } = explode(field)

          if (Array.isArray(values?.[gridName])) {
            if (conditionSchema.indexOf(gridName) < 0) {
              ;(values?.[gridName] || [])?.forEach((row, index) => {
                if (allowNoLines) {
                  const requiredFieldsInRow = Object.entries(rules)
                    .filter(([fieldKey, rule]) => fieldKey.startsWith(`${gridName}.`) && rule.required)
                    .map(([fieldKey]) => explode(fieldKey).fieldName)

                  const rowHasAnyValue = requiredFieldsInRow.some(field => {
                    const val = row?.[field]

                    return val !== '' && val != null
                  })

                  if (allowNoLines && !rowHasAnyValue) return
                }

                if (!maxAccessErrors[gridName]) {
                  maxAccessErrors[gridName] = []
                }

                if (!maxAccessErrors[gridName][index]) {
                  maxAccessErrors[gridName][index] = {}
                }
                const error = checkValidation(field, row[fieldName], rule)
                if (error) maxAccessErrors[gridName][index][fieldName] = error

                if (maxAccessErrors[gridName]?.every(obj => Object.keys(obj)?.length === 0)) {
                  delete maxAccessErrors[gridName]
                }
              })
            }
          } else {
            if (!maxAccessErrors[gridName]) {
              maxAccessErrors[gridName] = {}
            }

            const error = checkValidation(field, values[gridName][fieldName], rule)
            if (error) maxAccessErrors[gridName][fieldName] = error

            if (maxAccessErrors[gridName] && Object.keys(maxAccessErrors[gridName]).length === 0) {
              delete maxAccessErrors[gridName]
            }
          }
        }
      })
      ;(maxAccess?.record?.controls ?? []).forEach(obj => {
        const { controlId, accessLevel } = obj
        if (accessLevel === MANDATORY)
          if (controlId?.indexOf('.') < 0 && !Object.hasOwn(validation, controlId)) {
            const keys = Object.keys(formik.values)
            if (!values[controlId] && keys?.indexOf(controlId) > -1)
              maxAccessErrors = {
                ...maxAccessErrors,
                [controlId]: `${controlId} is required.`
              }
          } else {
            const { gridName, fieldName } = explode(controlId)

            if (!Object.hasOwn(validation, controlId))
              if (Array.isArray(values?.[gridName])) {
                if (conditionSchema.indexOf(gridName) < 0) {
                  ;(values?.[gridName] || [])?.forEach((row, index) => {
                    if (!maxAccessErrors[gridName]) {
                      maxAccessErrors[gridName] = []
                    }

                    if (!maxAccessErrors[gridName][index]) {
                      maxAccessErrors[gridName][index] = {}
                    }

                    if (!row[fieldName] || row[fieldName] == 0) {
                      maxAccessErrors[gridName][index][fieldName] = `${fieldName} is required.`
                    } else {
                      if (maxAccessErrors[gridName][index][fieldName])
                        delete maxAccessErrors[gridName][index][fieldName]

                      if (Object.keys(maxAccessErrors[gridName][index])?.length === 0) {
                        delete maxAccessErrors[gridName][index]
                      }
                    }

                    if (maxAccessErrors[gridName]?.every(obj => Object.keys(obj)?.length === 0)) {
                      delete maxAccessErrors[gridName]
                    }
                  })
                }
              } else {
                if (!maxAccessErrors[gridName]) {
                  maxAccessErrors[gridName] = {}
                }
                if (
                  !maxAccessErrors[gridName][fieldName] &&
                  formik.values[gridName] &&
                  !formik.values[gridName][fieldName] &&
                  formik.values[gridName][fieldName] !== 0 &&
                  formik.values[gridName][fieldName] !== '0'
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
  const { key, value, reference } = documentType

  useEffect(() => {
    if (key && value && formik.values[key] !== value) formik.setFieldValue(key, value)
  }, [value])

  useEffect(() => {
    if (reference?.isEmpty) {
      formik.setFieldValue(reference?.fieldName, '')
    }
  }, [reference?.isEmpty])

  return { formik, setFieldValidation, filterRowsWithEmptyRequiredFields }
}
