import { DialogContent } from '@mui/material'
import { useState } from 'react'
import WindowToolbar from './WindowToolbar'
import TransactionLog from './TransactionLog'
import { TrxType } from 'src/resources/AccessLevels'
import { ResourceIds } from 'src/resources/ResourceIds'

export default function FormShell({ formik, children, height, editMode, maxAccess }) {
  const [windowInfo, setWindowInfo] = useState(null)

  const windowToolbarVisible = editMode
    ? maxAccess < TrxType.EDIT
      ? false
      : true
    : maxAccess < TrxType.ADD
    ? false
    : true

  return (
    <>
      <DialogContent sx={{ height: false ? `calc(100vh - 48px - 180px)` : height, p: 0 }}>{children}</DialogContent>
      {windowToolbarVisible && (
        <WindowToolbar onSave={() => formik.handleSubmit()} onInfo={() => setWindowInfo(true)} />
      )}
      {windowInfo && (
        <TransactionLog
          resourceId={ResourceIds && ResourceIds.BPMasterData}
          onInfoClose={() => setWindowInfo(false)}
          recordId={formik.values.recordId}
        />
      )}
    </>
  )
}
