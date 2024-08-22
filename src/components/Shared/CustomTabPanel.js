// ** MUI Imports
import { Box } from '@mui/material'

import PropTypes from 'prop-types'

const CustomTabPanel = props => {
  const { children, value, height, index, ...other } = props

  return (
    <Box
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      sx={{
        display: value !== index ? 'none !important' : 'flex !important',
        flexDirection: 'column',
        width: '100%',
        flex: '1 !important',
        position: 'relative',
        overflow: 'auto',
        '.MuiDialogContent-root': {
          padding: '10px !important'
        }
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
  value: PropTypes.number.isRequired
}

export default CustomTabPanel
