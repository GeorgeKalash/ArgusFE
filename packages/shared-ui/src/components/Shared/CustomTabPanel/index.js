import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Box } from '@mui/material'
import PropTypes from 'prop-types'
import styles from './CustomTabPanel.module.css'
import { HIDDEN } from '@argus/shared-utils/src/utils/maxAccess'

const CustomTabPanel = props => {
  const { children, value, index, maxAccess, ...other } = props
  const name = `${props.name || 'tab'}.${index}`

  const containerRef = useRef(null)
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
    if (parent) {
      const parentRect = parent.getBoundingClientRect()

      const heightInsideParent = parentRect.bottom - rect.top 

      if (heightInsideParent > 0) {
        setHeightPx(heightInsideParent)
        return
      }
    }

    const viewportHeight = window.innerHeight - top 
    setHeightPx(viewportHeight)
  }

  useLayoutEffect(() => {
    computeHeight()

    const t = setTimeout(computeHeight, 50)
    return () => clearTimeout(t)
  }, [containerRef])

  useEffect(() => {
    const onResize = () => computeHeight()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [containerRef])

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
