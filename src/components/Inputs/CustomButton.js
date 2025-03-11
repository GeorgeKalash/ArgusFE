import { Button } from '@mui/material'
import { useState } from 'react'

const CustomButton = ({ onClick, label, image, color, border, disabled, tooltipText, style, ...props }) => {
  const [tooltip, setTooltip] = useState('')

  const handleButtonMouseEnter = () => {
    if (!disabled) {
      setTooltip(tooltipText)
    }
  }

  const handleButtonMouseLeave = () => {
    setTooltip(null)
  }

  return (
    <div
      className='button-container'
      onMouseEnter={handleButtonMouseEnter}
      onMouseLeave={handleButtonMouseLeave}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      <Button
        onClick={onClick}
        variant='contained'
        sx={{
          mr: 1,
          backgroundColor: color,
          '&:hover': {
            backgroundColor: color,
            opacity: 0.8
          },
          border: border,
          width: 'auto',
          height: '33px',
          wordWrap: 'break-word',
          lineHeight: 1.5,
          ...style
        }}
        disabled={disabled}
        {...props}
      >
        {image ? <img src={`/images/buttonsIcons/${image}`} alt={label} /> : label}
      </Button>
      {image && tooltip && (
        <div
          className='toast'
          style={{
            position: 'absolute',
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#333333ad',
            color: 'white',
            padding: '3px 7px',
            borderRadius: '7px',
            opacity: tooltip ? 1 : 0,
            visibility: tooltip ? 'visible' : 'hidden',
            transition: 'opacity 0.3s, top 0.3s',
            zIndex: 1
          }}
        >
          {tooltip}
        </div>
      )}
    </div>
  )
}

export default CustomButton
