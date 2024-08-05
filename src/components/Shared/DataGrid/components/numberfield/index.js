import { getFormattedNumber } from 'src/lib/numberField-helper'
import edit from './edit'

export default {
  view: ({ value }) => (value === 0 ? 0 : getFormattedNumber(value)),
  edit
}
