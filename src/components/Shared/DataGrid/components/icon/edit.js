import { Icon } from '@iconify/react'

export default function icon({ column, row, field }) {
  return (
    <>
      {row?.[field] ? (
        <Icon icon='mdi:check' style={{ fontSize: '28px', color: '#4eb558' }} />
      ) : (
        <Icon icon='mdi:close' style={{ fontSize: '28px', color: '#f44336' }} />
      )}
    </>
  )
}
