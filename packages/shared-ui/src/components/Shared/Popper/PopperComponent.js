import React, { useEffect, useState, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { Box } from '@mui/material'
import styles from './PopperComponent.module.css'

const PopperComponent = ({
  children,
  anchorEl,
  open,
  isDateTimePicker = false,
  matchAnchorWidth = true,
  fitContent = false,

  ...props
}) => {
  const [rect, setRect] = useState(null)
  const [measuredHeight, setMeasuredHeight] = useState(null)
  const [isPickerContent, setIsPickerContent] = useState(false)
  const [isTimePickerContent, setIsTimePickerContent] = useState(false)
  const popperRef = useRef(null)

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

    const handleScrollOrResize = () => updateRect()

    window.addEventListener('scroll', handleScrollOrResize, true)
    window.addEventListener('resize', handleScrollOrResize)

    return () => {
      window.removeEventListener('scroll', handleScrollOrResize, true)
      window.removeEventListener('resize', handleScrollOrResize)
    }
  }, [anchorEl, open, updateRect])

  const anchorTop = rect ? rect.top : 0
  const anchorBottom = rect ? rect.bottom : 0
  const anchorWidth = rect ? rect.width : undefined
  const left = rect ? rect.left : 0

  useEffect(() => {
    if (!open || !popperRef.current) return

    const pickerNode = popperRef.current.querySelector(
      '.MuiDateCalendar-root, .MuiMultiSectionDigitalClock-root, .MuiTimeClock-root, .MuiClock-root'
    )

    const nextIsPicker = !!pickerNode
    if (nextIsPicker !== isPickerContent) setIsPickerContent(nextIsPicker)

    const timeNode = popperRef.current.querySelector(
      '.MuiMultiSectionDigitalClock-root, .MuiTimeClock-root, .MuiClock-root'
    )

    const nextIsTime = !!timeNode
    if (nextIsTime !== isTimePickerContent) setIsTimePickerContent(nextIsTime)
  }, [open, rect, isPickerContent, isTimePickerContent])

  const isPicker = isPickerContent || isDateTimePicker
  const isTimePicker = isTimePickerContent

  useEffect(() => {
    if (!open || !popperRef.current) return
    const r = popperRef.current.getBoundingClientRect()
    if (r.height > 0 && r.height !== measuredHeight) setMeasuredHeight(r.height)
  }, [open, rect, measuredHeight])

  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 0
  const defaultEstimate = isTimePicker ? 300 : isPicker ? 340 : viewportHeight * 0.43
  const popperHeightForFlip = measuredHeight ?? defaultEstimate
  const openAbove = rect ? viewportHeight - anchorBottom <= popperHeightForFlip : false

  const shouldMatchAnchorWidth = !isPicker && !fitContent && matchAnchorWidth

  const baseStyle = {
    position: 'fixed',
    left,
    top: openAbove ? anchorTop : anchorBottom,
    transform: openAbove ? 'translateY(calc(-100% - 4px))' : 'none',
    overflow: 'visible',
    ...(shouldMatchAnchorWidth ? { width: anchorWidth } : {}),
    ...(isPicker || fitContent
      ? {
          width: 'max-content',
          maxWidth: 'calc(100vw - 16px)'
        }
      : {})
  }

  const mergedStyle = { ...baseStyle, ...(props.style || {}) }

  if (!rect) return null

  return ReactDOM.createPortal(
    <Box
      ref={popperRef}
      className={[
        styles.popperRoot,
        open ? styles.popperOpen : styles.popperClosed,
        isPicker ? styles.dateTimePopper : '',
        isTimePicker ? styles.timePopper : '',
        props.className || ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={mergedStyle}
    >
      {typeof children === 'function'
        ? children({
            placement: openAbove ? 'top-start' : 'bottom-start',
            TransitionProps: { in: true }
          })
        : children}
    </Box>,
    document.body
  )
}

export default PopperComponent
