import { DialogContent } from '@mui/material'
import { useState } from 'react'
import WindowToolbar from './WindowToolbar'
import TransactionLog from './TransactionLog'
import { TrxType } from 'src/resources/AccessLevels'
import { ClientRelationForm } from './ClientRelationForm'
import { useWindow } from 'src/windows'

export default function FormShell({ form, children, height, editMode, disabledSubmit , infoVisible=true ,resourceId, maxAccess , clientRelation=false }) {
  const [windowInfo, setWindowInfo] = useState(null)
  const { stack } = useWindow()

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
      {windowToolbarVisible && <WindowToolbar onSave={() => form.handleSubmit()} onInfo={() => stack({
          Component: TransactionLog,
          props: {
            recordId: form.values.recordId,
            resourceId: resourceId,

          },
          width: 700,
          height: 400,
          title : 'Transaction Log'

        })}
      onClientRelation={() => stack({
          Component: ClientRelationForm,
          props: {
            recordId: form.values.recordId,
            name : form.values.firstName +' '+ form.values.lastName,
            reference : form.values.reference,
          },
          width: 900,
          height: 600,
          title : 'Client Relation'

        })}

        editMode={editMode} disabledSubmit={disabledSubmit} infoVisible={infoVisible} clientRelation={clientRelation}/>}
      {windowInfo &&   (
        <TransactionLog
          resourceId={resourceId}
          onInfoClose={() => setWindowInfo(false)}
          recordId={form.values.recordId}
        />
      )}

    </>
  )
}
