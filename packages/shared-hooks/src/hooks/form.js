import { useFormik } from 'formik'
import { useEffect, useRef, useLayoutEffect } from 'react'
import { DISABLED, HIDDEN, MANDATORY } from '@argus/shared-utils/src/utils/maxAccess'
import * as yup from 'yup'

export function useForm({ documentType = {}, conditionSchema = [], maxAccess, validate = () => {}, ...formikProps }) {
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

  const originalSubmit = formikProps.onSubmit;

  const formik = useFormik({
    ...formikProps,
    onSubmit: async (values, helpers) => {
      submitSucceededRef.current = false

      try {
        await originalSubmit?.(values, helpers)
        submitSucceededRef.current = true
      } catch (error) {
        submitSucceededRef.current = false
        throw error
      }
    },
    validate(values) {
      let maxAccessErrors = {}

      ;(maxAccess?.record?.controls ?? []).forEach(obj => {
        const { controlId, accessLevel } = obj
        if (accessLevel === MANDATORY)
          if (controlId?.indexOf('.') < 0) {
            const keys = Object.keys(formik.values)
            if (!values[controlId] && keys?.indexOf(controlId) > -1)
              maxAccessErrors = {
                ...maxAccessErrors,
                [controlId]: `${controlId} is required.`
              }
          } else {
            const { gridName, fieldName } = explode(controlId)

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
                    if (maxAccessErrors[gridName][index][fieldName]) delete maxAccessErrors[gridName][index][fieldName]

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

  const submitSucceededRef = useRef(false)
  const wasSubmittingRef = useRef(false)

  useEffect(() => {
    if (formik.isSubmitting) {
      wasSubmittingRef.current = true
      return
    }

    if (
      wasSubmittingRef.current &&
      !formik.isSubmitting &&
      submitSucceededRef.current
    ) {
      wasSubmittingRef.current = false
      submitSucceededRef.current = false

      formik.resetForm({
        values: formik.values
      })
    }
  }, [formik.isSubmitting])

  formik.validationSchema, dynamicValidationSchema(formikProps?.validationSchema)

  const { key, value, reference } = documentType

  useLayoutEffect(() => {
    if (!key || value == null || formik.values[key] === value) return

    formik.setFieldValue(key, value)
  }, [value])

  useEffect(() => {
    if (reference?.isEmpty) {
      formik.setFieldValue(reference?.fieldName, '')
    }
  }, [reference?.isEmpty])

  const normalized = value => {
    if (value instanceof Date) return value.dateOnly ? value.toDateString() : value.valueOf()
    if (Array.isArray(value)) return value.map(normalized)
    if (value && typeof value === 'object')
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normalized(v)]).filter(([, v]) => v !== null && v !== undefined))

    return value
  }

  const dirty = JSON.stringify(normalized(formik.values)) !== JSON.stringify(normalized(formik.initialValues))
  
  return {
    formik: {
      ...formik,
      dirty 
    }
  }
}
