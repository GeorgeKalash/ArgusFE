import React from 'react'
import { Box } from '@mui/material'
import PropTypes from 'prop-types'
import { HIDDEN } from '@argus/shared-utils/src/utils/maxAccess'

const CustomTabPanel = props => {
  const { children, value, index, maxAccess, ...other } = props

  const name = `${props.name || 'tab'}.${index}`

  const { accessLevel } =
    (maxAccess?.record?.controls ?? []).find(c => c.controlId === name) ??
    { accessLevel: 0 }

  if (accessLevel === HIDDEN) return null

  const isActive = value === index

  return (
    <>
      <Box
        role='tabpanel'
        hidden={!isActive}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        className={`tabPanel ${isActive ? 'active' : 'hidden'}`}
        {...other}
      >
        {children}
      </Box>

      <style jsx global>{`
        .tabPanel {
          display: flex !important;
          flex-direction: column;
          width: 100%;
          min-height: 0 !important;
        }

        .active {
          flex: 1 !important;
          overflow-y: auto !important;
          overflow-x: hidden !important;
        }

        .hidden {
          display: none !important;
        }
      `}</style>
    </>
  )
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
}

export default CustomTabPanel
