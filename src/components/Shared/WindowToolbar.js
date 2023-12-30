// ** MUI Imports
import { DialogActions, Button } from '@mui/material'

const WindowToolbar = ({ onSave, onClear, onInfo }) => {
  return (
    <DialogActions>
      {onClear && (
        <Button onClick={onClear} variant='contained'>
          Clear
        </Button>
      )}
       {onInfo && (
        <Button onClick={onInfo} variant='contained'>
          Info
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
