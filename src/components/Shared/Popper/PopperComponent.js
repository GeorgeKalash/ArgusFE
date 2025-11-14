import React, { useEffect, useState, useRef } from 'react'
import ReactDOM from 'react-dom'
import { Box } from '@mui/material'
import styles from './PopperComponent.module.css'

const PopperComponent = ({ children, anchorEl, open, isDateTimePicker = false, ...props }) => {
  const [rect, setRect] = useState(anchorEl?.getBoundingClientRect())
  const popperRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      if (anchorEl) {
        setRect(anchorEl.getBoundingClientRect())
      }
    }

    const handleResize = () => {
      if (anchorEl) {
        setRect(anchorEl.getBoundingClientRect())
      }
    }

    const mutationObserver = new MutationObserver(() => handleResize())

    if (anchorEl) {
      mutationObserver.observe(anchorEl, { attributes: true, childList: true, subtree: true })
    }
    window.addEventListener('scroll', handleScroll, true)

    return () => {
      if (anchorEl) {
        mutationObserver.disconnect()
      }
      window.removeEventListener('scroll', handleScroll, true)
    }
  }, [anchorEl])

  const zoom = parseFloat(getComputedStyle(document.body).getPropertyValue('--zoom'))

  const canRenderBelow = window.innerHeight - rect?.bottom > popperRef?.current?.getBoundingClientRect()?.height

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
        top: rect?.bottom / zoom,
        left: rect?.left / zoom,
        transform: !canRenderBelow ? `translateY(calc(-100% - 10px - ${rect?.height}px))` : 'none',
        ...props?.style
      }}
    >
      {typeof children === 'function'
        ? children({
            placement: 'top-start',
            TransitionProps: {
              in: true
            }
          })
        : children}
    </Box>,
    document.body
  )
}

export default PopperComponent
