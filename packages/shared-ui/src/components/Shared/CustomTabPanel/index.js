import { Box } from '@mui/material'
import PropTypes from 'prop-types'
import styles from './CustomTabPanel.module.css'
import { HIDDEN } from '@argus/shared-utils/src/utils/maxAccess'

const CustomTabPanel = props => {
  const { children, value, height, index, maxAccess, ...other } = props
  const name = `${props.name || 'tab'}.${index}`

  const { accessLevel } = (maxAccess?.record?.controls ?? []).find(({ controlId }) => controlId == name) ?? 0

  const hidden = accessLevel === HIDDEN

  return hidden ? (
    <></>
  ) : (
    <Box
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      className={`${styles.tabPanel} ${value !== index ? styles.hidden : ''}`}
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
