import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Box } from '@mui/material'
import PropTypes from 'prop-types'
import styles from './CustomTabPanel.module.css'
import { HIDDEN } from '@argus/shared-utils/src/utils/maxAccess'

const CustomTabPanel = props => {
  const { children, value, index, maxAccess, ...other } = props
  const name = `${props.name || 'tab'}.${index}`

  const containerRef = useRef(null)
  const rafRef = useRef(null)
  const lastHeightRef = useRef(null)

  const [heightPx, setHeightPx] = useState(null)

  const { accessLevel } =
    (maxAccess?.record?.controls ?? []).find(({ controlId }) => controlId == name) ?? { accessLevel: 0 }

  const hidden = accessLevel === HIDDEN

  const computeHeight = () => {
    const el = containerRef.current
    if (!el) return

    const rect = el.getBoundingClientRect()
    const top = rect.top

    const parent = el.parentElement
    let newHeight = null

    if (parent) {
      const parentRect = parent.getBoundingClientRect()
      const heightInsideParent = parentRect.bottom - rect.top

      if (heightInsideParent > 0) {
        newHeight = Math.floor(heightInsideParent)
      }
    }

    if (newHeight === null) {
      newHeight = Math.floor(window.innerHeight - top)
    }

    if (lastHeightRef.current !== newHeight) {
      lastHeightRef.current = newHeight
      setHeightPx(newHeight)
    }
  }

  useLayoutEffect(() => {
    computeHeight()
    const t = setTimeout(computeHeight, 50)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const onResize = () => computeHeight()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el || !el.parentElement) return

    const parent = el.parentElement
    const observer = new ResizeObserver(() => {
      computeHeight()
    })

    observer.observe(parent)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      computeHeight()
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const loop = () => {
      computeHeight()
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  if (hidden) return null

  return (
    <Box
      ref={containerRef}
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      className={`${styles.tabPanel} ${value !== index ? styles.hidden : ''}`}
      style={{
        height: heightPx ? `${heightPx}px` : undefined,
        maxHeight: heightPx ? `${heightPx}px` : undefined,
        overflow: 'auto'
      }}
      {...other}
    >
      {children}
    </Box>
  )
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  bottomOffset: PropTypes.number
}

export default CustomTabPanel