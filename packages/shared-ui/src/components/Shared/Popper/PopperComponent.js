import React, { useEffect, useState, useRef, useCallback } from 'react'
import ReactDOM from 'react-dom'
import { Box } from '@mui/material'
import styles from './PopperComponent.module.css'

const GAP_PX = 4
const EDGE_PADDING_PX = 8

const NARROW_VIEWPORT_MAX_WIDTH_PX = 600
const VIEWPORT_SIDE_PADDING_PX = 16
const VIEWPORT_MAX_WIDTH_CSS = `calc(100vw - ${VIEWPORT_SIDE_PADDING_PX}px)`

const SCALE_MIN = 0.86
const SCALE_MAX = 1
const SCALE_REFERENCE_VIEWPORT_HEIGHT_PX = 700

// Estimated picker heights (used only when measuredHeight is 0)
const DEFAULT_TIME_PICKER_ESTIMATE_HEIGHT_PX = 300
const DEFAULT_DATE_PICKER_ESTIMATE_HEIGHT_PX = 340
const DEFAULT_GENERIC_POPOVER_ESTIMATE_RATIO = 0.43

// Popper maxHeight ratios/caps for pickers (relative to viewportHeight)
const POPPER_RATIO_SHORT_DATE = 0.82
const POPPER_RATIO_SHORT_TIME = 0.78
const POPPER_RATIO_TALL = 0.72

const CALENDAR_RATIO_SHORT_DATE = 0.68
const CALENDAR_RATIO_SHORT_TIME = 0.64
const CALENDAR_RATIO_TALL = 0.62

// Absolute minimum maxHeight floors
const POPPER_MIN_MAX_HEIGHT_SHORT_DATE_PX = 220
const POPPER_MIN_MAX_HEIGHT_OTHER_PX = 180

const CALENDAR_MIN_MAX_HEIGHT_SHORT_DATE_PX = 280
const CALENDAR_MIN_MAX_HEIGHT_OTHER_PX = 240

// “Short screen” threshold
const SHORT_VIEWPORT_MAX_HEIGHT_PX = 600

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

  const viewportWidth =
    typeof window !== 'undefined'
      ? window.visualViewport?.width ?? window.innerWidth
      : 0

  const isNarrow = viewportWidth <= NARROW_VIEWPORT_MAX_WIDTH_PX

  const scale = isPicker
    ? Math.min(
        SCALE_MAX,
        Math.max(SCALE_MIN, viewportHeight / SCALE_REFERENCE_VIEWPORT_HEIGHT_PX)
      )
    : 1

  const defaultEstimate = isTimePicker
    ? DEFAULT_TIME_PICKER_ESTIMATE_HEIGHT_PX
    : isPicker
      ? DEFAULT_DATE_PICKER_ESTIMATE_HEIGHT_PX
      : viewportHeight * DEFAULT_GENERIC_POPOVER_ESTIMATE_RATIO

  const popperHeightForFlip = measuredHeight || defaultEstimate

  const spaceBelow = Math.max(0, viewportHeight - rect.bottom - EDGE_PADDING_PX)
  const spaceAbove = Math.max(0, rect.top - EDGE_PADDING_PX)

  const openAbove =
    spaceBelow < popperHeightForFlip &&
    (spaceAbove >= popperHeightForFlip || spaceAbove > spaceBelow)

  const availableSpace = Math.max(0, (openAbove ? spaceAbove : spaceBelow) - GAP_PX)

  const shouldMatchAnchorWidth = !isPicker && !fitContent && matchAnchorWidth

  let calendarMaxHeight
  let mergedStyle

  if (isPicker) {
    const isShort = viewportHeight <= SHORT_VIEWPORT_MAX_HEIGHT_PX
    const isDate = isPicker && !isTimePicker

    const popperRatio = isShort && isDate
      ? POPPER_RATIO_SHORT_DATE
      : isShort
        ? POPPER_RATIO_SHORT_TIME
        : POPPER_RATIO_TALL

    const popperCap = viewportHeight * popperRatio
    const popperMinMaxHeight = isShort && isDate
      ? POPPER_MIN_MAX_HEIGHT_SHORT_DATE_PX
      : POPPER_MIN_MAX_HEIGHT_OTHER_PX

    const popperMaxHeight = Math.max(
      popperMinMaxHeight,
      Math.min(availableSpace, popperCap)
    )

    const scaledPopperMaxHeight = popperMaxHeight / scale

    const calendarRatio = isShort && isDate
      ? CALENDAR_RATIO_SHORT_DATE
      : isShort
        ? CALENDAR_RATIO_SHORT_TIME
        : CALENDAR_RATIO_TALL

    const calendarCap = viewportHeight * calendarRatio
    const calendarMinMaxHeight = isShort && isDate
      ? CALENDAR_MIN_MAX_HEIGHT_SHORT_DATE_PX
      : CALENDAR_MIN_MAX_HEIGHT_OTHER_PX

    calendarMaxHeight = Math.max(
      calendarMinMaxHeight,
      Math.min(availableSpace, calendarCap)
    )

    const narrowWidthStyle = {
      width: VIEWPORT_MAX_WIDTH_CSS,
      maxWidth: VIEWPORT_MAX_WIDTH_CSS
    }
    const wideWidthStyle = {
      width: 'max-content',
      maxWidth: VIEWPORT_MAX_WIDTH_CSS
    }

    const baseStyle = {
      position: 'fixed',
      left: rect.left,
      top: openAbove ? rect.top : rect.bottom,
      transform: openAbove
        ? `translateY(calc(-100% - ${GAP_PX}px)) scale(${scale})`
        : `scale(${scale})`,
      transformOrigin: openAbove ? 'bottom left' : 'top left',
      overflow: 'hidden',
      maxHeight: scaledPopperMaxHeight,
      height: 'auto',
      ...(isNarrow ? narrowWidthStyle : wideWidthStyle)
    }

    mergedStyle = { ...baseStyle, ...(userStyle || {}) }
  } else {
    const baseStyle = {
      position: 'fixed',
      left: rect.left,
      top: openAbove ? rect.top : rect.bottom,
      transform: openAbove ? `translateY(calc(-100% - ${GAP_PX}px))` : 'none',
      transformOrigin: openAbove ? 'bottom left' : 'top left',
      overflow: 'visible',
      ...(shouldMatchAnchorWidth ? { width: rect.width } : {}),
      ...(fitContent ? { width: 'max-content' } : {}),
      maxWidth: VIEWPORT_MAX_WIDTH_CSS
    }

    mergedStyle = { ...baseStyle, ...(userStyle || {}) }
    calendarMaxHeight = undefined
  }

  return {
    openAbove,
    calendarMaxHeight,
    isNarrow,
    mergedStyle
  }
}

const PICKER_ROOT_SELECTOR =
  '.MuiDateCalendar-root, .MuiMultiSectionDigitalClock-root, .MuiTimeClock-root, .MuiClock-root'
const TIME_PICKER_ROOT_SELECTOR =
  '.MuiMultiSectionDigitalClock-root, .MuiTimeClock-root, .MuiClock-root'

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

    const visualViewport = typeof window !== 'undefined' ? window.visualViewport : null
    if (visualViewport) {
      visualViewport.addEventListener('resize', handle)
      visualViewport.addEventListener('scroll', handle)
    }

    return () => {
      window.removeEventListener('scroll', handle, true)
      window.removeEventListener('resize', handle)
      if (visualViewport) {
        visualViewport.removeEventListener('resize', handle)
        visualViewport.removeEventListener('scroll', handle)
      }
    }
  }, [anchorEl, open, updateRect])

  useEffect(() => {
    if (!open || !popperRef.current) return

    const root = popperRef.current

    const pickerNode = root.querySelector(PICKER_ROOT_SELECTOR)
    const timeNode = root.querySelector(TIME_PICKER_ROOT_SELECTOR)

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
    requestAnimationFrame(measure)

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
                '& .MuiPickersLayout-root': {
                  display: layout.isNarrow ? 'flex' : 'inline-flex',
                  flexDirection: 'column',
                  alignItems: layout.isNarrow ? 'stretch' : 'flex-start',
                  justifyContent: 'flex-start',
                  height: 'auto',
                  minHeight: 'unset',
                  maxHeight: 'unset',
                  padding: 0,
                  margin: 0,
                  overflow: 'visible'
                },

                '& .MuiPickersLayout-contentWrapper': {
                  flex: '0 0 auto',
                  height: 'auto',
                  minHeight: 'unset',
                  padding: 0,
                  margin: 0,
                  overflow: 'visible',
                  width: layout.isNarrow ? '100%' : 'auto'
                },

                '& .MuiPickersLayout-actionBar, & .MuiPickersActionBar-root': {
                  flex: '0 0 auto',
                  margin: 0
                },

                '& .MuiDateCalendar-root': {
                  flex: '0 0 auto',
                  height: 'auto',
                  maxHeight: layout.calendarMaxHeight,
                  overflowY: 'auto',
                  overflowX: 'hidden',
                  width: layout.isNarrow ? '100%' : 'auto'
                },

                '& .MuiMultiSectionDigitalClock-root, & .MuiTimeClock-root, & .MuiClock-root': {
                  flex: '0 0 auto',
                  height: 'auto',
                  maxHeight: layout.calendarMaxHeight,
                  overflowY: 'hidden',
                  overflowX: 'hidden',
                  width: layout.isNarrow ? '100%' : 'auto'
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
