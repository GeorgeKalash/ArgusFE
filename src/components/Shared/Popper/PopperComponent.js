import React, { useEffect, useState, useRef } from 'react'
import ReactDOM from 'react-dom'
import { Box } from '@mui/material'

const PopperComponent = ({ children, anchorEl, open }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [rect, setRect] = useState(anchorEl?.getBoundingClientRect())
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

  const zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--zoom'))
  const thresholdPercentage = 0.35

  const canRenderBelow = window.innerHeight / zoom - (rect && rect.bottom) > window.innerHeight * thresholdPercentage
  console.log(zoom)

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
        transform: !canRenderBelow ? `translateY(calc(-100% - 10px - ${rect?.height}px))` : 'none'
      }}
    >
      {children}
    </Box>,
    document.body
  )
}

export default PopperComponent
