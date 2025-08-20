import { Button, CircularProgress } from '@mui/material'
import { useState } from 'react'

const CustomButton = ({
  onClick,
  label,
  image,
  color,
  border,
  disabled,
  tooltipText,
  viewLoader = false,
  style,
  ...props
}) => {
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
    <>
      <style>
        {`
          .button-container {
            position: relative;
            display: inline-block;
          }
          .toast {
            position: absolute;
            top: -30px;
            background-color: #333333ad;
            color: white;
            padding: 3px 7px;
            border-radius: 7px;
            opacity: 0;
            transition: opacity 0.3s, top 0.3s;
            z-index: 1 !important;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: none;
          }
          .button-container:hover .toast {
            opacity: 1;
            top: -40px;
            display: inline;
          }
        `}
      </style>
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
            width: image ? '50px' : 'auto',
            height: '35px',
            minWidth: image ? '30px' : 'auto',
            padding: '7px',
            wordWrap: 'break-word',
            lineHeight: 1.5,
            ...style
          }}
          disabled={disabled || viewLoader}
          {...props}
        >
          {viewLoader ? (
            <CircularProgress size={20} color='inherit' sx={{ color: 'black' }} />
          ) : image ? (
            <img
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
              }}
              src={`/images/buttonsIcons/${image}`}
              alt={label}
            />
          ) : (
            label
          )}
        </Button>
        {tooltip && (
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
    </>
  )
}

export default CustomButton
