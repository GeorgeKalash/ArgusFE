import { getFormattedNumber } from 'src/lib/numberField-helper'
import edit from './edit'
import { SystemChecks } from 'src/resources/SystemChecks'
import { useContext } from 'react'
import { ControlContext } from 'src/providers/ControlContext'

export function View({ value }) {
  const { systemChecks } = useContext(ControlContext)
  const viewDecimals = systemChecks.some(check => check.checkId === SystemChecks.HIDE_LEADING_ZERO_DECIMALS)

  const formatValue = val => {
    if (!val && val !== 0) return ''
    if (isNaN(val)) return val

    return String(val)
      .replace(/\.0+$/, '')
      .replace(/(\.\d*?[1-9])0+$/, '$1')
  }

  return viewDecimals ? getFormattedNumber(formatValue(value)) : getFormattedNumber(value)
}

export default {
  view: View,
  edit
}
