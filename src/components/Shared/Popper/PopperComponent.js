import React, { useEffect, useState, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { Box } from '@mui/material'
import styles from './PopperComponent.module.css'

const PopperComponent = ({ children, anchorEl, open, isDateTimePicker = false, ...props }) => {
  const [rect, setRect] = useState(null)
  const popperRef = useRef(null)
  const [isPickerContent, setIsPickerContent] = useState(false)

  const updateRect = useCallback(() => {
    if (!anchorEl) return

    const nextRect = anchorEl.getBoundingClientRect()

    setRect(prev => {
      if (
        !prev ||
        prev.top !== nextRect.top ||
        prev.left !== nextRect.left ||
        prev.width !== nextRect.width ||
        prev.height !== nextRect.height
      ) {
        return nextRect
      }
      
      return prev
    })
  }, [anchorEl])

  useEffect(() => {
    if (!anchorEl || !open) return

    updateRect()

    const handleScroll = () => {
      updateRect()
    }

    window.addEventListener('scroll', handleScroll, true)
    window.addEventListener('resize', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll, true)
      window.removeEventListener('resize', handleScroll)
    }
  }, [anchorEl, open, updateRect])

  const zoomValue =
    typeof window !== 'undefined'
      ? parseFloat(getComputedStyle(document.body).getPropertyValue('--zoom'))
      : 1
  const zoom = Number.isFinite(zoomValue) && zoomValue > 0 ? zoomValue : 1

  const anchorWidth = rect ? rect.width / zoom : undefined
  const top = rect ? rect.bottom / zoom : 0
  const left = rect ? rect.left / zoom : 0

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

  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0

  const estimatedPopperHeight = (() => {
    if (isPicker) {
      return 320 / zoom
    }

   
    return viewportHeight ? viewportHeight * 0.43 : 300
  })()

  const canRenderBelow = rect ? viewportHeight - top > estimatedPopperHeight : true

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
