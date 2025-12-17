import React from 'react'
import { Box } from '@mui/material'
import PropTypes from 'prop-types'
import styles from './CustomTabPanel.module.css'
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
    <Box
      role="tabpanel"
      hidden={!isActive}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      className={`${styles.tabPanel} ${isActive ? styles.active : styles.hidden}`}
      {...other}
    >
      {children}
    </Box>
  )
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
}

export default CustomTabPanel
