// ** MUI Imports
import { DialogActions, Button } from '@mui/material'

const WindowToolbar = ({ onSave, onClear }) => {
  return (
    <DialogActions>
      {onClear && (
        <Button onClick={onClear} variant='contained'>
          Clear
        </Button>
      )}
      {onSave && (
        <Button onClick={onSave} variant='contained'>
          Submit
        </Button>
      )}
    </DialogActions>
  )
}

export default WindowToolbar
