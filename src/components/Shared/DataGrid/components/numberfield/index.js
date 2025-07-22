import { getFormattedNumber } from 'src/lib/numberField-helper'
import edit from './edit'
import { SystemChecks } from 'src/resources/SystemChecks'
import { useContext, useEffect } from 'react'
import { ControlContext } from 'src/providers/ControlContext'
import { iconMapView } from 'src/utils/iconMap'
import { checkAccess } from 'src/lib/maxAccess'

export function View({ value, data, gridName, setFieldValidation, column: { props, name } }) {
  const { systemChecks } = useContext(ControlContext)
  const viewDecimals = systemChecks.some(check => check.checkId === SystemChecks.HIDE_LEADING_ZERO_DECIMALS)
  const symbol = props?.iconKey && props?.iconKey({ data })
  const fullName = `${gridName}.${name}`
  const conditions = props?.onCondition ? props?.onCondition(data) : {}

  const { _required, _hidden } = checkAccess(
    fullName,
    props?.maxAccess,
    props?.required,
    props?.readOnly,
    props?.hidden
  )

  useEffect(() => {
    if (typeof setFieldValidation === 'function') {
      setFieldValidation(prev => {
        const existing = prev?.[fullName]

        // const shouldRemove = existing && !_required && !conditions?.minValue && !conditions?.maxValue
        // if (shouldRemove) {
        //   const newState = { ...prev }
        //   delete newState[fullName]

        //   return newState
        // }

        const next = {
          required: _required && !_hidden,
          minValue: conditions?.minValue,
          maxValue: conditions?.maxValue
        }

        const isEqual =
          existing?.required === next.required &&
          existing?.minValue === next.minValue &&
          existing?.maxValue === next.maxValue

        return isEqual ? prev : { ...prev, [fullName]: next }
      })
    }
  }, [conditions?.minValue, conditions?.maxValue, _required])

  const formatValue = val => {
    if (!val && val !== 0) return ''
    if (isNaN(val)) return val

    return String(val)
      .replace(/\.0+$/, '')
      .replace(/(\.\d*?[1-9])0+$/, '$1')
  }

  const formattedValue = viewDecimals ? getFormattedNumber(formatValue(value)) : getFormattedNumber(value)
  const icon = symbol && iconMapView[symbol]

  return (
    <>
      {formattedValue}
      {icon && <span>{icon}</span>}
    </>
  )
}

export default {
  view: View,
  edit
}
