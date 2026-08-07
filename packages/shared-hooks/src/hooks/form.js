import { useFormik } from 'formik'
import { useEffect, useRef, useLayoutEffect, useContext } from 'react'
import { DISABLED, HIDDEN, MANDATORY } from '@argus/shared-utils/src/utils/maxAccess'
import * as yup from 'yup'
import usePageInteraction from '@argus/shared-providers/src/providers/usePageInteraction'
import { useInteractionTracker } from '@argus/shared-providers/src/providers/InteractionTrackerProvider'
import { MenuContext } from '@argus/shared-providers/src/providers/MenuContext'
import { useWindow } from '@argus/shared-providers/src/providers/windows'

export function useForm({ behavior, conditionSchema = [], maxAccess, validate = () => {}, isParentLevel = false, ...formikProps }) {
  const windowContext = useWindow()
  const isImmediateWindow = windowContext?.isImmediateWindow ?? false
  const isInsideWindow = windowContext?.isInsideWindow ?? false

  const trackInteraction = usePageInteraction()
  const { clearPageInteractions } = useInteractionTracker()
  const {
    openTabs,
    currentTabIndex
  } = useContext(MenuContext)
  const currentTab = openTabs?.[currentTabIndex] || null

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
            const keys = Object.keys(values)
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
                values[gridName] &&
                !values[gridName][fieldName] &&
                values[gridName][fieldName] !== 0 &&
                values[gridName][fieldName] !== '0'
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

  const { key, value, fieldBehavior } = behavior || {}
  const { isEmpty, fieldName } = fieldBehavior || {}

  useLayoutEffect(() => {
    if (!key || value == null || formik.values[key] === value) return

    formik.setFieldValue(key, value)
  }, [value])

  useEffect(() => {
    if (isEmpty) formik.setFieldValue(fieldName, '')
  }, [isEmpty])

  const areDatesEqual = (a, b) => {
    const eitherIsDateOnly = (a instanceof Date && a.dateOnly) || (b instanceof Date && b.dateOnly)

    if (eitherIsDateOnly) {
      return a.toDateString() === b.toDateString()
    }

    return a.valueOf() === b.valueOf()
  }

  const deepEqual = (a, b) => {
    if (a instanceof Date || b instanceof Date) {
      if (!(a instanceof Date) || !(b instanceof Date)) return false
      return areDatesEqual(a, b)
    }

    if (Array.isArray(a) || Array.isArray(b)) {
      if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false
      return a.every((item, i) => deepEqual(item, b[i]))
    }

    if (a && typeof a === 'object' && b && typeof b === 'object') {
      const keysA = Object.keys(a).filter(k => a[k] !== null && a[k] !== undefined)
      const keysB = Object.keys(b).filter(k => b[k] !== null && b[k] !== undefined)
      if (keysA.length !== keysB.length) return false
      return keysA.every(k => keysB.includes(k) && deepEqual(a[k], b[k]))
    }

    return a === b
  }

  const getDirtyFields = (values, initialValues) => {
    const diffs = {}
    const allKeys = new Set([...Object.keys(values || {}), ...Object.keys(initialValues || {})])

    allKeys.forEach(key => {
      if (!deepEqual(values?.[key], initialValues?.[key])) {
        diffs[key] = {
          from: initialValues?.[key],
          to: values?.[key]
        }
      }
    })

    return diffs
  }

  const dirty = !deepEqual(formik.values, formik.initialValues)
  const dirtyFields = getDirtyFields(formik.values, formik.initialValues) //help us to know faster what are the dirty fields

  useEffect(() => {
    if (!isImmediateWindow && isInsideWindow) return
    
    if (dirty) trackInteraction('form')
    else clearPageInteractions(currentTab?.resourceId)
  }, [dirty])

  return {
    formik: {
      ...formik,
      dirty
    }
  }
}