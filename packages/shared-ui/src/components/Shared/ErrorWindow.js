import React from 'react'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import CustomButton from '../Inputs/CustomButton'

const ErrorWindow = ({ open, onClose, message }) => {
  const errorMessage =
    typeof message === 'string'
      ? message
      : !message?.response
      ? message?.message
      : message?.response?.data?.error
      ? message.response.data.error
      : message?.response?.data

  return (
    <Dialog open={open} onClose={onClose} TransitionProps={{ timeout: 0 }} keepMounted={false}>
      <DialogTitle>Error</DialogTitle>
      <DialogContent>
        <DialogContentText>{errorMessage}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <CustomButton
          onClick={onClose}
          label={'OK'}
        />
      </DialogActions>
    </Dialog>
  )
}

export default ErrorWindow
