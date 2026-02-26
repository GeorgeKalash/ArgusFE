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

const TINY_TIME_SECTION_CLASS = 'noSectionScroll'

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

  useEffect(() => {
    if (!popperRef.current) return
    if (!isTimePicker && !isDateTimePicker) return

    let cancelled = false

    const isItemOutsideVisibleArea = (item, container) => {
      if (!item || !container || !container.getBoundingClientRect) return false

      const itemRect = item.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      const topThreshold = containerRect.top + 8
      const bottomThreshold = containerRect.bottom - 8

      return itemRect.top < topThreshold || itemRect.bottom > bottomThreshold
    }

    const centerItemInScroller = (selected, scroller) => {
      if (!selected || !scroller) return
      if (!isItemOutsideVisibleArea(selected, scroller)) return

      selected.scrollIntoView({
        block: 'center',
        inline: 'nearest',
        behavior: 'auto'
      })

      if (typeof scroller.scrollTop === 'number' && scroller.getBoundingClientRect) {
        const itemRect = selected.getBoundingClientRect()
        const containerRect = scroller.getBoundingClientRect()

        const delta =
          itemRect.top -
          containerRect.top -
          containerRect.height / 2 +
          itemRect.height / 2

        if (Math.abs(delta) > 2) scroller.scrollTop += delta
      }
    }

    const classifyAndScrollSections = () => {
      if (cancelled || !popperRef.current) return

      const root = popperRef.current
      const sections = root.querySelectorAll('.MuiMultiSectionDigitalClockSection-root')

      if (sections.length) {
        sections.forEach(section => {
          const options = section.querySelectorAll('[role="option"], li')
          const optionCount = options.length

          const isTinySection = optionCount > 0 && optionCount <= 3

          if (isTinySection) {
            section.classList.add(TINY_TIME_SECTION_CLASS)
          } else {
            section.classList.remove(TINY_TIME_SECTION_CLASS)
          }

          const selected =
            section.querySelector('[role="option"][aria-selected="true"]') ||
            section.querySelector('.Mui-selected')

          if (!selected) return

          const scroller =
            selected.closest('ul') ||
            section.querySelector('ul') ||
            section

          const scrollerCanScroll =
            scroller &&
            typeof scroller.scrollHeight === 'number' &&
            typeof scroller.clientHeight === 'number' &&
            scroller.scrollHeight > scroller.clientHeight + 2

          if (!scrollerCanScroll || isTinySection) return

          centerItemInScroller(selected, scroller)
        })

        return
      }

      const selected =
        root.querySelector('[role="option"][aria-selected="true"]') ||
        root.querySelector('.Mui-selected')

      if (selected) {
        const scroller = selected.closest('ul') || selected.parentElement || root
        centerItemInScroller(selected, scroller)
      }
    }

    const raf1 = requestAnimationFrame(classifyAndScrollSections)
    const raf2 = requestAnimationFrame(() => requestAnimationFrame(classifyAndScrollSections))
    const t1 = setTimeout(classifyAndScrollSections, 80)
    const t2 = setTimeout(classifyAndScrollSections, 200)

    return () => {
      cancelled = true
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [isTimePicker, isDateTimePicker, rect])

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

                '& .MuiMultiSectionDigitalClock-root': {
                  flex: '0 0 auto',
                  height: 'auto',
                  maxHeight: layout.calendarMaxHeight,
                  overflow: 'hidden',
                  overflowX: 'hidden',
                  width: layout.isNarrow ? '100%' : 'auto'
                },

                '& .MuiMultiSectionDigitalClockSection-root': {
                  maxHeight: layout.calendarMaxHeight,
                  overflowY: 'auto',
                  overflowX: 'hidden'
                },

                '& .MuiMultiSectionDigitalClockSection-root ul': {
                  maxHeight: 'inherit',
                  overflowY: 'auto',
                  overflowX: 'hidden'
                },
                [`& .MuiMultiSectionDigitalClockSection-root.${TINY_TIME_SECTION_CLASS}`]: {
                  overflowY: 'hidden'
                },
                [`& .MuiMultiSectionDigitalClockSection-root.${TINY_TIME_SECTION_CLASS} ul`]: {
                  overflowY: 'hidden'
                },

                '& .MuiTimeClock-root, & .MuiClock-root': {
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
