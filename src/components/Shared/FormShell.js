import { DialogContent } from '@mui/material'
import { useState } from 'react'
import WindowToolbar from './WindowToolbar'
import TransactionLog from './TransactionLog'
import { TrxType } from 'src/resources/AccessLevels'
import { ClientRelationForm } from './ClientRelationForm'
import { useWindow } from 'src/windows'

export default function FormShell({
  form, form1,
  children,
  height,
  editMode,
  setEditMode,
  disabledSubmit,
  infoVisible = true,
  postVisible = false,
  resourceId,
  maxAccess,
  isPosted = false,
  clientRelation = false,
  setErrorMessage,
  initialValues, initialValues1
}) {
  const [windowInfo, setWindowInfo] = useState(null)
  const { stack } = useWindow()

  const windowToolbarVisible = editMode
    ? maxAccess < TrxType.EDIT
      ? false
      : true
    : maxAccess < TrxType.ADD
    ? false
    : true

    function handleReset(){
      console.log(initialValues)
      initialValues &&  form.setValues(initialValues)
       if(form1){
        form1.setValues(initialValues1)
       }

     setEditMode(false)
    }

  return (
    <>
      <DialogContent sx={{ flex: 1, height: '100%' , zIndex: 0 }}>{children}</DialogContent>
      {windowToolbarVisible && (
        <WindowToolbar
          onSave={() => form.handleSubmit()}
          onClear={() => initialValues ?  handleReset() : false
        }
          onPost={() => {
            // Set a flag in the Formik state before calling handleSubmit
            form.setFieldValue('isOnPostClicked', true)
            form.handleSubmit()
          }}
          onInfo={() =>
            stack({
              Component: TransactionLog,
              props: {
                recordId: form.values.recordId ?? form.values.clientId,
                resourceId: resourceId,
                setErrorMessage: setErrorMessage
              },
              width: 700,
              height: 400,
              title: 'Transaction Log'
            })
          }
          onClientRelation={() =>
            stack({
              Component: ClientRelationForm,
              props: {
                recordId: form.values.recordId ?? form.values.clientId,
                name: form.values.firstName ? form.values.firstName + ' ' + form.values.lastName : form.values.name,
                reference: form.values.reference,
                setErrorMessage: setErrorMessage
              },
              width: 900,
              height: 600,
              title: 'Client Relation'
            })
          }
          editMode={editMode}
          disabledSubmit={disabledSubmit}
          infoVisible={infoVisible}
          postVisible={postVisible}
          isPosted={isPosted}
          clientRelation={clientRelation}
        />
      )}
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
