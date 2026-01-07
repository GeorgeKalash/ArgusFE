import { Icon } from '@iconify/react'
import edit from './edit'

export default {
  view({ data, colDef: { field } }) {
    return (
      <>
        {data?.[field] ? (
          <Icon icon='mdi:check' style={{ fontSize: '28px', color: '#4eb558' }} />
        ) : (
          <Icon icon='mdi:close' style={{ fontSize: '28px', color: '#f44336' }} />
        )}
      </>
    )
  },
  edit
}
