import React from 'react'
import ReactDOM from 'react-dom'
import { Box } from '@mui/material'

const PopperComponent = ({ children, anchorEl, open }) => {
  const zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--zoom'))
  const thresholdPercentage = 0.25

  const canRenderBelow =
    window.innerHeight / zoom - (anchorEl && anchorEl.getBoundingClientRect().bottom) >
    window.innerHeight * thresholdPercentage

  const rect = anchorEl && anchorEl.getBoundingClientRect()

  return ReactDOM.createPortal(
    <Box
      sx={{
        zIndex:'2 !important',
        display: open ? 'block' : 'none'
      }}
      style={{
        position: 'absolute',
        minWidth: anchorEl ? anchorEl.clientWidth : 'auto',
        top: rect.bottom,
        left: rect.left,
        transform: !canRenderBelow ? `translateY(calc(-100% - 10px - ${rect.height}px))` : 'none'
      }}
    >
      {children}
    </Box>,
    document.body
  )
}

export default PopperComponent
