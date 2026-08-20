import PropTypes from 'prop-types'
import { useSettings } from '@argus/shared-core/src/@core/hooks/useSettings'

const modalStyle = {
  background: '#fff',
  borderRadius: 8,
  width: 400,
  maxWidth: '90%',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
}

const headerStyle = {
  background: '#1f1f1f',
  color: '#fff',
  padding: '12px 16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontWeight: 'bold'
}

const messageStyle = {
  padding: 20,
  fontSize: 14,
  color: '#333'
}

const footerStyle = {
  padding: '12px 16px',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px'
}

const buttonStyle = {
  background: '#1f1f1f',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  padding: '8px 16px',
  cursor: 'pointer'
}

const cancelButtonStyle = {
  background: '#ccc',
  color: '#000',
  border: 'none',
  borderRadius: 4,
  padding: '8px 16px',
  cursor: 'pointer'
}

export function TabConfirmationDialog({ open, title, message, cancelLabel, confirmLabel, onCancel, onConfirm }) {
  const { settings } = useSettings()
  const { navCollapsed } = settings
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 100

  const menuWidth =
    screenWidth <= 768 ? 180 :
    screenWidth <= 1024 ? 200 :
    screenWidth <= 1280 ? 210 :
    screenWidth <= 1366 ? 220 :
    screenWidth <= 1600 ? 240 : 300

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: navCollapsed ? 10 : menuWidth,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999
  }

  if (!open) return null

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>{title}</div>
        <div style={messageStyle}>{message}</div>
        <div style={footerStyle}>
          <button style={cancelButtonStyle} onClick={onCancel}>
            {cancelLabel}
          </button>
          <button style={buttonStyle} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

TabConfirmationDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.node,
  message: PropTypes.node,
  cancelLabel: PropTypes.node,
  confirmLabel: PropTypes.node,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired
}