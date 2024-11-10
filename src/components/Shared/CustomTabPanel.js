// ** MUI Imports
import { Box } from '@mui/material'

import PropTypes from 'prop-types'
import { Suspense } from 'react'

const CustomTabPanel = props => {
  const { children, value, height, index, ...other } = props

  function LoadingOverlay() {
    return (
      <Box
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          left: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
      >
        <CircularProgress color='inherit' />
      </Box>
    )
  }

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
      <Suspense fallback={<LoadingOverlay />}>{children}</Suspense>
    </Box>
  )
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
}

export default CustomTabPanel
