import { Icon } from '@iconify/react'
import edit from './edit'

export default {
  view({ value, field, row, column: { props } }) {
    return value ? (
      <Icon icon='mdi:checkbox-marked' style={{ fontSize: 24 }} />
    ) : (
      <Icon
        icon='mdi:checkbox-blank-outline'
        style={{ fontSize: 24, opacity: ((!row?.saved && field === 'select') || props?.disabled) && 0.2 }}
      />
    )
  },
  edit
}
