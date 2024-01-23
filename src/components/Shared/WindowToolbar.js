// ** MUI Imports
import { DialogActions, Button } from '@mui/material'

const WindowToolbar = ({ onSave, onClear, onInfo , disabledSubmit, editMode=false, smallBox=false }) => {
  return (
    <DialogActions>
      {onClear && (
        <Button onClick={onClear} variant='contained'>
          Clear
        </Button>
      )}
       {onInfo && (
        <Button onClick={onInfo} variant='contained' disabled={!editMode}>
        Info
        </Button>
      )}
      {onSave && (
        <Button onClick={onSave} variant='contained' sx={{mt: smallBox && 0}} disabled={disabledSubmit}>
        Submit
        </Button>
      )}
       {onApply && (
        <Button onClick={onApply} variant='contained' disabled={disabledApply}>
          Apply
        </Button>
      )}
    </DialogActions>
  )
}

export default WindowToolbar
