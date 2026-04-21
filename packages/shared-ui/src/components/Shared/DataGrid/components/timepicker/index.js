import edit from './edit'
import dayjs from 'dayjs'

export default {
  view: ({ value }) => {
    if (!value) return null

    return dayjs(value).format('HH:mm')      
  },
  edit
}