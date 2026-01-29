// ** MUI Imports
import { DialogActions, Button } from '@mui/material'


const WindowToolbarDocuments = ({ onSave, onClear, onInfo,onReject , disabledSubmit, editMode=false, smallBox=false ,  infoVisible=true , clientRelation, onClientRelation=false }) => {
  return (
    <DialogActions>
      {onClear && (
        <Button onClick={onClear} variant='contained'>
          Clear
        </Button>
      )}
       {clientRelation && (
        <Button onClick={onClientRelation} variant='contained' sx={{mt: smallBox && 0}} disabled={!editMode}>
        Client Relation
        </Button>
      )}


       {onInfo && infoVisible && (
        <Button onClick={onInfo} variant='contained' disabled={!editMode}>
        Info
        </Button>
      )}
         {onReject&&(
            <Button onClick={onReject} variant='contained' sx={{mt: smallBox && 0}} >
              Reject
              </Button>
      )}

      {onSave && (
        <Button onClick={onSave} variant='contained' sx={{mt: smallBox && 0}} disabled={disabledSubmit}>
        Approve
        </Button>
      )}
   
    </DialogActions>
  )
}

export default WindowToolbarDocuments
