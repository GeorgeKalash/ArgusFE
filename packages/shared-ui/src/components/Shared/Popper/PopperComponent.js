import React, { useEffect, useState, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { Box } from '@mui/material'
import styles from './PopperComponent.module.css'

const GAP = 4
const EDGE_PADDING = 8

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
  const [measuredHeight, setMeasuredHeight] = useState(0)
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
        prev.height !== nextRect.height ||
        prev.bottom !== nextRect.bottom
      ) {
        return nextRect
      }
      return prev
    })
  }, [anchorEl])

  useEffect(() => {
    if (!anchorEl || !open) return

    updateRect()

    const handle = () => updateRect()

    window.addEventListener('scroll', handle, true)
    window.addEventListener('resize', handle)

    const w = typeof window !== 'undefined' ? window.visualViewport : null
    if (w) {
      w.addEventListener('resize', handle)
      w.addEventListener('scroll', handle)
    }

    return () => {
      window.removeEventListener('scroll', handle, true)
      window.removeEventListener('resize', handle)
      if (w) {
        w.removeEventListener('resize', handle)
        w.removeEventListener('scroll', handle)
      }
    }
  }, [anchorEl, open, updateRect])

  useEffect(() => {
    if (!open || !popperRef.current) return

    const root = popperRef.current

    const pickerNode = root.querySelector(
      '.MuiDateCalendar-root, .MuiMultiSectionDigitalClock-root, .MuiTimeClock-root, .MuiClock-root'
    )
    const timeNode = root.querySelector(
      '.MuiMultiSectionDigitalClock-root, .MuiTimeClock-root, .MuiClock-root'
    )

    const nextIsPicker = !!pickerNode
    if (nextIsPicker !== isPickerContent) setIsPickerContent(nextIsPicker)

    const nextIsTime = !!timeNode
    if (nextIsTime !== isTimePickerContent) setIsTimePickerContent(nextIsTime)
  }, [open, rect, isPickerContent, isTimePickerContent])

  const isPicker = isPickerContent || isDateTimePicker
  const isTimePicker = isTimePickerContent

  useEffect(() => {
    if (!open || !popperRef.current) return

    const node = popperRef.current

    const measure = () => {
      const r = node.getBoundingClientRect()
      if (r.height > 0) {
        setMeasuredHeight(prev => (prev !== r.height ? r.height : prev))
      }
    }

    measure()

    const ro = new ResizeObserver(() => measure())
    ro.observe(node)

    return () => ro.disconnect()
  }, [open])

  if (!rect) return null

  const anchorTop = rect.top
  const anchorBottom = rect.bottom
  const anchorWidth = rect.width
  const left = rect.left

  const viewportHeight =
    typeof window !== 'undefined'
      ? window.visualViewport?.height ?? window.innerHeight
      : 0

  const defaultEstimate = isTimePicker ? 300 : isPicker ? 340 : viewportHeight * 0.43
  const popperHeightForFlip = measuredHeight || defaultEstimate

  const spaceBelow = Math.max(0, viewportHeight - anchorBottom - EDGE_PADDING)
  const spaceAbove = Math.max(0, anchorTop - EDGE_PADDING)

  const openAbove =
    spaceBelow < popperHeightForFlip &&
    (spaceAbove >= popperHeightForFlip || spaceAbove > spaceBelow)

  const shouldMatchAnchorWidth = !isPicker && !fitContent && matchAnchorWidth

  const maxHeight = Math.max(160, (openAbove ? spaceAbove : spaceBelow) - GAP)

  const scale = Math.min(1, Math.max(0.86, viewportHeight / 700))
  const scaledMaxHeight = maxHeight / scale

  const baseStyle = {
    position: 'fixed',
    left,
    top: openAbove ? anchorTop : anchorBottom,
    transform: openAbove
      ? `translateY(calc(-100% - ${GAP}px)) scale(${scale})`
      : `scale(${scale})`,
    transformOrigin: openAbove ? 'bottom left' : 'top left',
    overflow: 'auto',
    maxHeight: scaledMaxHeight,

    ...(shouldMatchAnchorWidth ? { width: anchorWidth } : {}),
    ...(isPicker || fitContent
      ? {
          width: 'max-content',
          maxWidth: 'calc(100vw - 16px)'
        }
      : {})
  }

  const mergedStyle = { ...baseStyle, ...(props.style || {}) }

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
