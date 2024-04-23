import React from 'react'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Button from '@mui/material/Button'
import { Box, IconButton, Paper, Typography } from '@mui/material'
import Draggable from 'react-draggable'
import { useSettings } from 'src/@core/hooks/useSettings'
import { GridClearIcon } from '@mui/x-data-grid'

const ErrorWindow = ({ onClose, message }) => {
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

  const { settings } = useSettings()
  const { navCollapsed } = settings

  const left = !navCollapsed ? '5%' : '15%'
  const width = !navCollapsed ? '95%' : '80%'

  return (
    errorMessage && (
      <Box
        id='parent'
        sx={{
          top: 45,
          left: left,
          position: 'absolute',
          width: width,
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Draggable
          handle='#draggable-dialog-title'
          cancel={'[class*="MuiDialogContent-root"]'}
          bounds='parent'
          sx={{
            width: 20
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '50%'
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <Paper
              sx={{
                width: 500
              }}
            >
              <DialogTitle
                id='draggable-dialog-title'
                sx={{
                  cursor: 'move',
                  py: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 600 }}>Error</Typography>
                </Box>
                <Box>
                  <IconButton tabIndex={-1} edge='end' onClick={onClose} aria-label='clear input'>
                    <GridClearIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent sx={{ height: '300px', width: '480px' }}>{errorMessage}</DialogContent>

              <DialogActions>
                <Button onClick={onClose} color='primary'>
                  OK
                </Button>
              </DialogActions>
            </Paper>
          </Box>
        </Draggable>
      </Box>
    )
  )
}

export default ErrorWindow
