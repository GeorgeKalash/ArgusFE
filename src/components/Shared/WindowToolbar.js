// ** MUI Imports
import { DialogActions, Button } from '@mui/material'

const WindowToolbar = ({ onSave, onClear, onInfo , disabledSubmit, disabledInfo, onApply, disabledApply}) => {
  return (
    <DialogActions>
      {onClear && (
        <Button onClick={onClear} variant='contained'>
          Clear
        </Button>
      )}
       {onInfo && (
        <Button onClick={onInfo} variant='contained' disabled={disabledInfo}>
          Info
        </Button>
      )}
      {onSave && (
        <Button onClick={onSave} variant='contained' disabled={disabledSubmit}>
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
