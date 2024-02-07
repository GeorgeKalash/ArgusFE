import { DialogContent } from '@mui/material'
import { useState } from 'react'
import WindowToolbar from './WindowToolbar'
import TransactionLog from './TransactionLog'
import { TrxType } from 'src/resources/AccessLevels'
import { ClientRelationForm } from './ClientRelationForm'
import { useWindow } from 'src/windows'
import WindowToolbarDocuments from './windowToolBarDocuments'

export default function FormShellDocument({ onClose, form, children, height, editMode, disabledSubmit , infoVisible=true ,resourceId, maxAccess , clientRelation=false , setErrorMessage }) {

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

      <DialogContent sx={{ flex: 1, height: '100%' }}>{children}</DialogContent>
      {windowToolbarVisible && <WindowToolbarDocuments onSave={() => form.handleSubmit()} 
      onReject={onClose}
      onClientRelation={() => stack({
          Component: ClientRelationForm,
          props: {

            recordId: form.values.recordId ??  form.values.clientId ,
            name :form.values.firstName ? form.values.firstName +' '+ form.values.lastName : form.values.name,
            reference : form.values.reference,
            setErrorMessage:setErrorMessage

          },
          width: 900,
          height: 600,
          title : 'Client Relation'

        })}

        editMode={editMode} disabledSubmit={disabledSubmit} infoVisible={infoVisible} clientRelation={clientRelation}/>}


    </>
  )
}
