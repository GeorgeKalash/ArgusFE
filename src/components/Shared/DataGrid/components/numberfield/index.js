import { getFormattedNumber } from 'src/lib/numberField-helper'
import edit from './edit'
import { SystemChecks } from 'src/resources/SystemChecks'
import { useContext } from 'react'
import { ControlContext } from 'src/providers/ControlContext'
import { iconMapView } from 'src/utils/iconMap'

export function View({ value, data, ...props }) {
  const { systemChecks } = useContext(ControlContext)
  const hideLeadingZeros = systemChecks.some(check => check.checkId === SystemChecks.HIDE_LEADING_ZERO_DECIMALS)

  const symbol = props?.column?.props?.iconKey && props?.column?.props?.iconKey({ data })

  const formattedValue = getFormattedNumber(
    value,
    props.column?.props?.decimalScale,
    !!props.column?.props?.decimalScale,
    hideLeadingZeros
  )

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
