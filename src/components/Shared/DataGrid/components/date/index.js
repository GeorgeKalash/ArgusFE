import { formatTimestampToDate } from 'src/lib/date-helper'
import edit from './edit'

export default {
  view({ value }) {
   return value ? formatTimestampToDate(value): ''
  },
  edit
}
