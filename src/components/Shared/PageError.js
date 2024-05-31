import React from 'react'
import Window from './Window'
import { Box, Button } from '@mui/material'

const PageError = ({ onClose, message, height = 100 }) => {
  const errorMessage =
    typeof message === 'string'
      ? message
      : !message?.response
      ? message?.error
        ? message.error
        : message?.message
      : message?.response?.data?.error
      ? message.response.data.error
      : message?.response?.data

  const windowHeight = height + 50

  return (
    <Window Title='Error' width={450} height={windowHeight} onClose={onClose} canExpand={false}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: height
        }}
      >
        <Box
          sx={{
            flex: '1',
            overflow: 'auto',
            py: 2,
            mx: 2
          }}
        >
          {errorMessage}
        </Box>
        <Box
          sx={{
            flexShrink: 0,
            py: 1,
            px: 5,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <Button variant='contained' onClick={onClose} color='primary'>
            ok
          </Button>
        </Box>
      </Box>
    </Window>
  )
}

export default PageError
