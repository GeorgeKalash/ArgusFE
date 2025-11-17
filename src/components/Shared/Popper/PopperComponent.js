import React, { useEffect, useState, useRef } from 'react'
import ReactDOM from 'react-dom'
import { Box } from '@mui/material'
import styles from './PopperComponent.module.css'

const PopperComponent = ({ children, anchorEl, open, isDateTimePicker = false, ...props }) => {
  const [rect, setRect] = useState(anchorEl ? anchorEl.getBoundingClientRect() : null)
  const popperRef = useRef(null)

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

  // read zoom with safe fallback
  const zoomValue = typeof window !== 'undefined'
    ? parseFloat(getComputedStyle(document.body).getPropertyValue('--zoom'))
    : 1
  const zoom = Number.isFinite(zoomValue) && zoomValue > 0 ? zoomValue : 1

  const anchorWidth = rect ? rect.width / zoom : undefined
  const top = rect ? rect.bottom / zoom : 0
  const left = rect ? rect.left / zoom : 0

  const popperHeight = popperRef.current?.getBoundingClientRect()?.height || 0
  const canRenderBelow = rect ? window.innerHeight - top > popperHeight : true

  return ReactDOM.createPortal(
    <Box
      ref={popperRef}
      className={[
        styles.popperRoot,
        open ? styles.popperOpen : styles.popperClosed,
        isDateTimePicker ? styles.dateTimePopper : '',
        props.className || ''
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        position: 'absolute',
        top,
        left,
        width: anchorWidth,
        transform: !canRenderBelow && rect
          ? `translateY(calc(-100% - 10px - ${rect.height / zoom}px))`
          : 'none',
        ...(props.style || {}),
        width: anchorWidth
      }}
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
