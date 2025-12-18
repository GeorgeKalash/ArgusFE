import React from 'react'
import Window from './Window'
import { Box, Button, DialogActions, DialogContent } from '@mui/material'

const PageError = ({ onClose, message, height = '', spacing }) => {
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

  return (
    <Window
      Title='Error'
      width={450}
      spacing={spacing}
      height={height || 200}
      onClose={onClose}
      expandable={false}
      controlled={true}
      isLoading={false}
      refresh={false}
    >
      <DialogContent>
        <Box
          sx={{
            pt: 2
          }}
        >
          {errorMessage}
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          pb: 2
        }}
      >
        <Box
          sx={{
            pt: 2,
            pl: 2
          }}
        >
          <Button variant='contained' onClick={onClose} color='primary' autoFocus>
            Ok
          </Button>
        </Box>
      </DialogActions>
    </Window>
  )
}

export default PageError
