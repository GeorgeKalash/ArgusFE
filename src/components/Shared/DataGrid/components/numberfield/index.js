import { getFormattedNumber } from 'src/lib/numberField-helper'
import edit from './edit'
import { SystemChecks } from 'src/resources/SystemChecks'
import { useContext } from 'react'
import { ControlContext } from 'src/providers/ControlContext'
import { iconMapView } from 'src/utils/iconMap'

export function View({ value, data, ...props }) {
  const { systemChecks } = useContext(ControlContext)
  const viewDecimals = systemChecks.some(check => check.checkId === SystemChecks.HIDE_LEADING_ZERO_DECIMALS)

  const symbol = props?.column?.props?.iconKey && props?.column?.props?.iconKey({ data })

  const formatValue = val => {
    if (!val && val !== 0) return ''
    if (isNaN(val)) return val

    return String(val)
      .replace(/\.0+$/, '')
      .replace(/(\.\d*?[1-9])0+$/, '$1')
  }

  const formattedValue = viewDecimals
    ? getFormattedNumber(formatValue(value), props.column?.props?.decimalScale, !!props.column?.props?.decimalScale)
    : getFormattedNumber(value, props.column?.props?.decimalScale, !!props.column?.props?.decimalScale)
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
