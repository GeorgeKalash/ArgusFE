import React, { useEffect, useState, useRef } from 'react'
import ReactDOM from 'react-dom'
import { Box } from '@mui/material'

const PopperComponent = ({ children, anchorEl, open, ...props }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [rect, setRect] = useState(anchorEl?.getBoundingClientRect())
  const [popperRect, setPopperRect] = useState(null)

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
        const popperRect = popperRef.current.getBoundingClientRect()
        if (popperRect.height && popperRect.width) {
          setPopperRect(popperRef.current.getBoundingClientRect())
        }
      }
    }

    const handleResize = () => {
      if (anchorEl) {
        setRect(anchorEl.getBoundingClientRect())
        const popperRect = popperRef.current.getBoundingClientRect()
        if (popperRect.height && popperRect.width) {
          setPopperRect(popperRef.current.getBoundingClientRect())
        }
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

  const canRenderBelow = window.innerHeight - rect?.bottom > popperRect?.height

  return ReactDOM.createPortal(
    <Box
      ref={popperRef}
      sx={{
        zIndex: '2 !important',
        display: open && isVisible ? 'block' : 'none'
      }}
      style={{
        position: 'absolute',
        top: rect?.bottom / zoom,
        left: rect?.left / zoom,
        transform: !canRenderBelow ? `translateY(calc(-100% - 10px - ${rect?.height}px))` : 'none',
        ...props?.style
      }}
      className={props.className}
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
