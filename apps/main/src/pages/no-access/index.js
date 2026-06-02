import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import React, { useContext } from 'react'

export default function NoAccessPage() {
  const { platformLabels } = useContext(ControlContext)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flex: '1'
      }}
    >
      <h1 style={{ fontSize: '48px', color: '#333', marginBottom: '16px' }}>{platformLabels?.NoAccess}</h1>
      <p style={{ fontSize: '18px', color: '#666', marginBottom: '32px' }}>{platformLabels.DontHaveAccess}</p>
    </div>
  )
}
