import React, { useEffect, useState, useRef } from 'react'
import ReactDOM from 'react-dom'
import { Box } from '@mui/material'

const PopperComponent = ({ children, anchorEl, open }) => {
  const [isVisible, setIsVisible] = useState(true)

  const [unscaledRect, setUnscaledRect] = useState(anchorEl?.getBoundingClientRect())

  const popperRef = useRef(null)

  useEffect(() => {
    const handleIntersection = entries => {
      entries.forEach(entry => {
        setIsVisible(entry.isIntersecting)
      })
    }

    const observer = new IntersectionObserver(handleIntersection)
    if (popperRef.current) {
      observer.observe(popperRef.current)
    }

    return () => {
      if (popperRef.current) {
        observer.unobserve(popperRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (anchorEl) {
        setUnscaledRect(anchorEl.getBoundingClientRect())
      }
    }

    const handleResize = () => {
      if (anchorEl) {
        setUnscaledRect(anchorEl.getBoundingClientRect())
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

  useEffect(() => {
    if (open && anchorEl) {
      const handleIntersection = entries => {
        entries.forEach(entry => {
          setIsVisible(entry.isIntersecting)
        })
      }

      const observer = new IntersectionObserver(handleIntersection)
      observer.observe(anchorEl)

      return () => {
        observer.unobserve(anchorEl)
      }
    }
  }, [open, anchorEl])

  const zoom = parseFloat(getComputedStyle(document.body).getPropertyValue('--zoom'))
  const thresholdPercentage = 0.35

  const rect = {
    top: unscaledRect?.top / zoom,
    bottom: unscaledRect?.bottom / zoom,
    left: unscaledRect?.left / zoom,
    right: unscaledRect?.right / zoom
  }

  const canRenderBelow = window.innerHeight / zoom - rect.bottom > window.innerHeight * thresholdPercentage

  return ReactDOM.createPortal(
    <Box
      ref={popperRef}
      sx={{
        zIndex: '2 !important',
        display: open && isVisible ? 'block' : 'none',
        position: 'absolute',
        minWidth: anchorEl ? anchorEl.clientWidth : 'auto',
        top: rect?.bottom,
        left: rect?.left,
        transform: !canRenderBelow ? `translateY(calc(-100% - 10px - ${unscaledRect?.height}px))` : 'none'
      }}
    >
      {children}
    </Box>,
    document.body
  )
}

export default PopperComponent
