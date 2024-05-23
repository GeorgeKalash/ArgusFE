import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { Box } from '@mui/material'

const PopperComponent = ({ children, anchorEl, open }) => {
  const [rect, setRect] = useState(anchorEl?.getBoundingClientRect())

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

    const mutationObserver = new MutationObserver(() => {
      handleResize()
    })
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

  const zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--zoom'))
  const thresholdPercentage = 0.35

  const canRenderBelow = window.innerHeight / zoom - (rect && rect.bottom) > window.innerHeight * thresholdPercentage

  return ReactDOM.createPortal(
    <Box
      sx={{
        zIndex: '2 !important',
        display: open ? 'block' : 'none'
      }}
      style={{
        position: 'absolute',
        minWidth: anchorEl ? anchorEl.clientWidth : 'auto',
        top: rect?.bottom,
        left: rect?.left,
        transform: !canRenderBelow ? `translateY(calc(-100% - 10px - ${rect?.height}px))` : 'none'
      }}
    >
      {children}
    </Box>,
    document.body
  )
}

export default PopperComponent
