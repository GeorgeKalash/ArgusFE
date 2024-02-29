import { getFormattedNumber } from 'src/lib/numberField-helper'
import edit from './edit'

export default {
  view: ({ value }) => getFormattedNumber(value),
  edit
}
