import React from 'react'
import { Box } from '@mui/material'

const TooltipButton = ({ tooltipText }) => {
  return (
    <Box sx={{ position: 'relative', display: 'inline-block', marginRight: '10px' }}>
      <Box
        sx={{
          position: 'absolute',
          top: '-30px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#333',
          color: 'white',
          padding: '5px 10px',
          borderRadius: '5px',
          whiteSpace: 'nowrap',
          zIndex: 1,
          opacity: 0.9,
          pointerEvents: 'none'
        }}
      >
        {tooltipText}
      </Box>
    </Box>
  )
}

export default TooltipButton
