import { getFormattedNumber } from '@argus/shared-domain/src/lib/numberField-helper'
import edit from './edit'
import { SystemChecks } from '@argus/shared-domain/src/resources/SystemChecks'
import { useContext } from 'react'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { iconMapView } from '@argus/shared-utils/src/utils/iconMap'

export function View({ value, data, ...props }) {
  const { systemChecks } = useContext(ControlContext)
  const hideLeadingZeros = systemChecks.some(check => check.checkId === SystemChecks.HIDE_LEADING_ZERO_DECIMALS)

  const symbol = props?.column?.props?.iconKey && props?.column?.props?.iconKey({ data })

  const formattedValue = getFormattedNumber(value, props.column?.props?.decimalScale, true, hideLeadingZeros)

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
