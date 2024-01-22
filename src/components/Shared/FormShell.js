import { DialogContent } from '@mui/material'
import { useState } from 'react'
import WindowToolbar from './WindowToolbar'
import TransactionLog from './TransactionLog'
import { TrxType } from 'src/resources/AccessLevels'

export default function FormShell({ form, children, height, recordId, resourceId, maxAccess }) {
  const [windowInfo, setWindowInfo] = useState(null)
  const [editMode, setEditMode] = useState(!!recordId)

  const windowToolbarVisible = editMode
    ? maxAccess < TrxType.EDIT
      ? false
      : true
    : maxAccess < TrxType.ADD
    ? false
    : true

  return (
    <>
      <DialogContent sx={{ height: false ? `calc(100vh - 48px - 180px)` : height, p: 1 }}>{children}</DialogContent>
      {windowToolbarVisible && <WindowToolbar onSave={() => {form.handleSubmit(); setEditMode(true)}} onInfo={() => setWindowInfo(true)} editMode={editMode}/>}
      {windowInfo && (
        <TransactionLog
          resourceId={resourceId}
          onInfoClose={() => setWindowInfo(false)}
          recordId={form.values.recordId}
        />
      )}
    </>
  )
}
