import React, { useEffect, useState, useRef } from 'react'
import ReactDOM from 'react-dom'
import { Box } from '@mui/material'
import styles from './PopperComponent.module.css'

const PopperComponent = ({ children, anchorEl, open, isDateTimePicker = false, ...props }) => {
  const [rect, setRect] = useState(anchorEl ? anchorEl.getBoundingClientRect() : null)
  const popperRef = useRef(null)

  const [isPickerContent, setIsPickerContent] = useState(false)

  useEffect(() => {
    if (!anchorEl) return

    const updateRect = () => {
      if (anchorEl) {
        setRect(anchorEl.getBoundingClientRect())
      }
    }

    updateRect()

    const mutationObserver = new MutationObserver(updateRect)
    mutationObserver.observe(anchorEl, { attributes: true, childList: true, subtree: true })

    window.addEventListener('scroll', updateRect, true)
    window.addEventListener('resize', updateRect)

    return () => {
      mutationObserver.disconnect()
      window.removeEventListener('scroll', updateRect, true)
      window.removeEventListener('resize', updateRect)
    }
  }, [anchorEl])

  const zoomValue =
    typeof window !== 'undefined'
      ? parseFloat(getComputedStyle(document.body).getPropertyValue('--zoom'))
      : 1
  const zoom = Number.isFinite(zoomValue) && zoomValue > 0 ? zoomValue : 1

  const anchorWidth = rect ? rect.width / zoom : undefined
  const top = rect ? rect.bottom / zoom : 0
  const left = rect ? rect.left / zoom : 0

  const popperHeight = popperRef.current?.getBoundingClientRect()?.height || 0
  const canRenderBelow = rect ? window.innerHeight - top > popperHeight : true

  useEffect(() => {
    if (!open || !popperRef.current) return

    const pickerNode = popperRef.current.querySelector(
      '.MuiDateCalendar-root, .MuiMultiSectionDigitalClock-root, .MuiTimeClock-root, .MuiClock-root'
    )

    const nextIsPicker = !!pickerNode
    if (nextIsPicker !== isPickerContent) {
      setIsPickerContent(nextIsPicker)
    }
  }, [open, rect, isPickerContent])

  const isPicker = isPickerContent || isDateTimePicker

  const baseStyle = {
    position: 'absolute',
    top,
    left,

    ...(rect && !isPicker ? { width: anchorWidth } : {}),
    transform:
      !canRenderBelow && rect
        ? `translateY(calc(-100% - 10px - ${rect.height / zoom}px))`
        : 'none'
  }

  const mergedStyle = {
    ...baseStyle,
    ...(props.style || {})
  }

  return ReactDOM.createPortal(
    <Box
      ref={popperRef}
      className={[
        styles.popperRoot,
        open ? styles.popperOpen : styles.popperClosed,
        isPicker ? styles.dateTimePopper : '',
        props.className || ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={mergedStyle}
    >
      {typeof children === 'function'
        ? children({
            placement: 'top-start',
            TransitionProps: { in: true }
          })
        : children}
    </Box>,
    document.body
  )
}

export default PopperComponent
