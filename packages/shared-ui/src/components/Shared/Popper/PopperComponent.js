import React, { useEffect, useState, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { Box } from '@mui/material'
import styles from './PopperComponent.module.css'

const GAP = 4
const EDGE_PADDING = 8

function computeLayout({
  rect,
  measuredHeight,
  isPicker,
  isTimePicker,
  fitContent,
  matchAnchorWidth,
  userStyle
}) {
  if (!rect) return null

  const viewportHeight =
    typeof window !== 'undefined'
      ? window.visualViewport?.height ?? window.innerHeight
      : 0

  const scale = Math.min(1, Math.max(0.86, viewportHeight / 700))

  const defaultEstimate = isTimePicker
    ? 300
    : isPicker
      ? 340
      : viewportHeight * 0.43

  const popperHeightForFlip = measuredHeight || defaultEstimate

  const spaceBelow = Math.max(0, viewportHeight - rect.bottom - EDGE_PADDING)
  const spaceAbove = Math.max(0, rect.top - EDGE_PADDING)

  const openAbove =
    spaceBelow < popperHeightForFlip &&
    (spaceAbove >= popperHeightForFlip || spaceAbove > spaceBelow)

  const availableSpace = Math.max(0, (openAbove ? spaceAbove : spaceBelow) - GAP)

  const isShort = viewportHeight <= 600
  const isDate = isPicker && !isTimePicker

  const popperRatio = isShort && isDate ? 0.82 : isShort ? 0.78 : 0.72
  const popperCap = viewportHeight * popperRatio
  const popperMaxHeight = Math.max(isShort && isDate ? 220 : 180, Math.min(availableSpace, popperCap))
  const scaledPopperMaxHeight = popperMaxHeight / scale

  const calendarRatio = isShort && isDate ? 0.68 : isShort ? 0.64 : 0.62
  const calendarCap = viewportHeight * calendarRatio
  const calendarMaxHeight = Math.max(isShort && isDate ? 280 : 240, Math.min(availableSpace, calendarCap))

  const shouldMatchAnchorWidth = !isPicker && !fitContent && matchAnchorWidth

  const baseStyle = {
    position: 'fixed',
    left: rect.left,
    top: openAbove ? rect.top : rect.bottom,
    transform: openAbove
      ? `translateY(calc(-100% - ${GAP}px)) scale(${scale})`
      : `scale(${scale})`,
    transformOrigin: openAbove ? 'bottom left' : 'top left',
    overflow: isPicker ? 'hidden' : 'auto',
    maxHeight: scaledPopperMaxHeight,

    ...(shouldMatchAnchorWidth ? { width: rect.width } : {}),
    ...(isPicker || fitContent
      ? { width: 'max-content', maxWidth: 'calc(100vw - 16px)' }
      : {})
  }

  return {
    openAbove,
    calendarMaxHeight,
    mergedStyle: { ...baseStyle, ...(userStyle || {}) }
  }
}

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
    const nextIsTime = !!timeNode

    if (nextIsPicker !== isPickerContent) setIsPickerContent(nextIsPicker)
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

    const ro = new ResizeObserver(measure)
    ro.observe(node)

    return () => ro.disconnect()
  }, [open])

  if (!rect) return null

  const layout = computeLayout({
    rect,
    measuredHeight,
    isPicker,
    isTimePicker,
    fitContent,
    matchAnchorWidth,
    userStyle: props.style
  })

  if (!layout) return null

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
      style={layout.mergedStyle}
    >
      <Box
        sx={
          isPicker
            ? {
                '& .MuiPickersLayout-root, & .MuiPickersLayout-contentWrapper': {
                  overflow: 'visible'
                },

                '& .MuiDateCalendar-root': {
                  maxHeight: layout.calendarMaxHeight,
                  overflowY: 'auto',
                  overflowX: 'hidden'
                },

                '& .MuiMultiSectionDigitalClock-root, & .MuiTimeClock-root, & .MuiClock-root': {
                  maxHeight: layout.calendarMaxHeight,
                  overflowY: 'auto',
                  overflowX: 'hidden'
                }
              }
            : undefined
        }
      >
        {typeof children === 'function'
          ? children({
              placement: layout.openAbove ? 'top-start' : 'bottom-start',
              TransitionProps: { in: true }
            })
          : children}
      </Box>
    </Box>,
    document.body
  )
}

export default PopperComponent
