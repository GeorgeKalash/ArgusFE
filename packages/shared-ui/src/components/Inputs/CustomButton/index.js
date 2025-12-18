import { Button, CircularProgress } from '@mui/material'
import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import styles from './CustomButton.module.css'

const CustomButton = ({
  onClick,
  label,
  image,
  icon,
  color,
  border,
  disabled,
  tooltipText,
  viewLoader = false,
  style,
  ...props
}) => {
  const [tooltip, setTooltip] = useState(null)
  const buttonRef = useRef(null)

  const handleButtonMouseEnter = () => {
    if (disabled || !tooltipText) return
    if (!buttonRef.current) return

    const rect = buttonRef.current.getBoundingClientRect()
    setTooltip({
      top: rect.top - 8,
      left: rect.left + rect.width / 2
    })
  }

  const handleButtonMouseLeave = () => {
    setTooltip(null)
  }

  const imageIcon =
    image &&
    require(`@argus/shared-ui/src/components/images/buttonsIcons/${image}`)

  const isLabelOnly = !image && !icon && label

  return (
    <>
      <div
        className={!props.fullWidth && styles.buttonContainer}
        onMouseEnter={handleButtonMouseEnter}
        onMouseLeave={handleButtonMouseLeave}
      >
        <Button
          ref={buttonRef}
          onClick={onClick}
          variant='contained'
          className={[
            !props.fullWidth
              ? styles.responsiveButton
              : styles.responsiveButtonFullWidth,
            isLabelOnly ? styles.labelOnly : ''
          ].join(' ')}
          fullWidth={props.fullWidth}
          sx={{
            mr: 1,
            ...(color && {
              backgroundColor: color,
              '&:hover': {
                backgroundColor: color,
                opacity: 0.8
              }
            }),
            ...(border ? { border } : {}),
            wordWrap: 'break-word',
            ...style
          }}
          disabled={disabled || viewLoader}
          {...props}
        >
          {viewLoader ? (
            <CircularProgress size={20} color='inherit' sx={{ color: 'black' }} />
          ) : icon ? (
            icon
          ) : image ? (
            <img
              className={styles.buttonImage}
              src={imageIcon.default.src}
              alt={label}
            />
          ) : (
            label
          )}
        </Button>
      </div>

      {tooltipText &&
        image &&
        tooltip &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className={styles.toast}
            style={{
              top: tooltip.top,
              left: tooltip.left,
              transform: 'translate(-50%, -75%)'
            }}
          >
            {tooltipText}
          </div>,
          document.body
        )}
    </>
  )
}

export default CustomButton
