import { getFormattedNumber } from 'src/lib/numberField-helper'

export default function TextFieldView({ value, column: { props }, id }) {
  const viewPercentSymbol = props?.gridData ? props?.gridData[id - 1]?.mdType === 1 : false

  let UpdatedValue = value
  if (props?.type === 'numeric') UpdatedValue = getFormattedNumber(value)
  if (props?.concatenateWith && viewPercentSymbol) UpdatedValue = UpdatedValue + ' ' + props?.concatenateWith

  return UpdatedValue
}
