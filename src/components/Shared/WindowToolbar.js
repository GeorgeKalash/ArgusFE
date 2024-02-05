// ** MUI Imports
import { DialogActions, Button } from '@mui/material'

const WindowToolbar = ({
  onSave,
  onPost,
  onClear,
  onInfo,
  disabledSubmit,
  editMode = false,
  smallBox = false,
  infoVisible = true,
  postVisible = false,
  clientRelation,
  onClientRelation = false,
  isPosted = false
}) => {
  return (
    <DialogActions>
      {onClear && (
        <Button onClick={onClear} variant='contained'>
          Clear
        </Button>
      )}
      {clientRelation && (
        <Button onClick={onClientRelation} variant='contained' sx={{ mt: smallBox && 0 }} disabled={!editMode}>
          Client Relation
        </Button>
      )}

      {onInfo && infoVisible && (
        <Button onClick={onInfo} variant='contained' disabled={!editMode}>
          Info
        </Button>
      )}
      {onPost && postVisible && (
        <Button onClick={onPost} variant='contained' sx={{ mt: smallBox && 0 }} disabled={isPosted || !editMode}>
          Post
        </Button>
      )}
      {onSave && (
        <Button onClick={onSave} variant='contained' sx={{ mt: smallBox && 0 }} disabled={disabledSubmit || isPosted}>
          Submit
        </Button>
      )}
    </DialogActions>
  )
}

export default WindowToolbar
