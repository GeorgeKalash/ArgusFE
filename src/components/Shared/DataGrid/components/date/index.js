import edit from './edit'

export default {
  view({ value }) {
    return value?.toISOString()
  },
  edit
}
