import { getFormattedNumber } from '@argus/shared-domain/src/lib/numberField-helper'

export default function TextFieldView({ value, column: { props }, id }) {
  let UpdatedValue = value
  if (props?.type === 'numeric') UpdatedValue = getFormattedNumber(value)

  return UpdatedValue
}
