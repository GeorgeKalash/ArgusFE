import { Button, CircularProgress } from '@mui/material'
import { useState } from 'react'
import styles from './CustomButton.module.css'

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
    if (!disabled) setTooltip(tooltipText)
  }

  const handleButtonMouseLeave = () => {
    setTooltip(null)
  }

  return (
    <div className={styles.buttonContainer} onMouseEnter={handleButtonMouseEnter} onMouseLeave={handleButtonMouseLeave}>
      <Button
        onClick={onClick}
        variant='contained'
        className={styles.responsiveButton}
        sx={{
          mr: 1,
          backgroundColor: color,
          '&:hover': {
            backgroundColor: color,
            opacity: 0.8
          },
          ...(border ? { border } : {}),
          wordWrap: 'break-word',
          ...style
        }}
        disabled={disabled || viewLoader}
        {...props}
      >
        {viewLoader ? (
          <CircularProgress size={20} color='inherit' sx={{ color: 'black' }} />
        ) : image ? (
          <img className={styles.buttonImage} src={`/images/buttonsIcons/${image}`} alt={label} />
        ) : (
          label
        )}
      </Button>

      {tooltip && <div className={styles.toast}>{tooltip}</div>}
    </div>
  )
}

export default CustomButton
