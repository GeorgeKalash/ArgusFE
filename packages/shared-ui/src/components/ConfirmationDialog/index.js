import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box
} from '@mui/material'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { useContext } from 'react'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import styles from './ConfirmationDialog.module.css'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import FormShell from '@argus/shared-ui/src/components/Shared/FormShell'

const ConfirmationDialog = ({
  openCondition,
  closeCondition,
  DialogText,
  okButtonAction,
  fullScreen = true,
  window,
  ...props
}) => {
  const { platformLabels } = useContext(ControlContext)

  const actions = [
    {
      key: 'Ok',
      condition: true,
      onClick: () => {
        okButtonAction(window)
        if (props?.close) window?.close()
      },
      disabled: false
    }
  ]

  if (!fullScreen) {
    return (
      <FormShell isSaved={false} isInfo={false} isCleared={false} actions={actions}>
        <VertLayout>
          <Grow>
            <Box className={styles.content}>{DialogText}</Box>
          </Grow>
        </VertLayout>
      </FormShell>
    )
  }

  return (
    <Dialog
      className={styles.dialog}
      open={openCondition}
      onClose={closeCondition}
      fullWidth
      maxWidth="xs"
      PaperProps={{ className: styles.dialogPaper }}
      BackdropProps={{ className: styles.dialogBackdrop }}
>
      <DialogTitle>{platformLabels.Confirmation}</DialogTitle>

      <DialogContent>
        <DialogContentText className={styles.dialogText}>
          {DialogText}
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <CustomButton onClick={() => okButtonAction(window)} label={platformLabels.OK} />
      </DialogActions>
    </Dialog>
  )
}

export default ConfirmationDialog
