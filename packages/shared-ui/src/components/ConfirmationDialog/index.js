import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box
} from '@mui/material'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useContext } from 'react'
import styles from './ConfirmationDialog.module.css'

const ConfirmationDialog = ({
  openCondition,
  closeCondition,
  DialogText,
  okButtonAction,
  fullScreen = true,
  window,
  height = '120px',
  ...props
}) => {
  const { platformLabels } = useContext(ControlContext)

  return !fullScreen ? (
    <Box
      className={styles.container}
      style={{ '--dialog-height': height }}
    >
      <Box className={styles.content}>
        {DialogText}
      </Box>

      <Box className={styles.actions}>
        <Button
          autoFocus
          onClick={() => {
            okButtonAction(window)
            if (props?.close) window.close()
          }}
          color="primary"
        >
          {platformLabels.OK}
        </Button>
      </Box>
    </Box>
  ) : (
    <Dialog
      className={styles.dialog}
      open={openCondition}
      onClose={closeCondition}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>{platformLabels.Confirmation}</DialogTitle>

      <DialogContent>
        <DialogContentText className={styles.dialogText}>
          {DialogText}
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={okButtonAction} color="primary">
          {platformLabels.OK}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog
