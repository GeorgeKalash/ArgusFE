// ** MUI Imports
import { DialogActions, Button } from '@mui/material'

const WindowToolbar = ({ onSave, onClear, onInfo , disabledSubmit, editMode}) => {
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
        <Button onClick={onSave} variant='contained' disabled={disabledSubmit}>
          Submit
        </Button>
      )}
    </DialogActions>
  )
}

export default WindowToolbar
