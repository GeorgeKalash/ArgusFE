import { Icon } from '@iconify/react'

export default function icon({ value, field }) {
  return (
    <>
      {value?.[field] ? (
        <Icon icon='mdi:check' style={{ fontSize: '28px', color: '#4eb558' }} />
      ) : (
        <Icon icon='mdi:close' style={{ fontSize: '28px', color: '#f44336' }} />
      )}
    </>
  )
}
