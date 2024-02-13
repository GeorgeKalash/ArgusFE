import { DialogContent, Box } from '@mui/material'
import { useState } from 'react'
import WindowToolbar from './WindowToolbar'
import TransactionLog from './TransactionLog'
import { TrxType } from 'src/resources/AccessLevels'
import { ClientRelationForm } from './ClientRelationForm'
import { useWindow } from 'src/windows'
import PreviewReport from './PreviewReport'

export default function FormShell({
  form,
  children,
  height,
  editMode,
  disabledSubmit,
  infoVisible = true,
  postVisible = false,
  resourceId,
  maxAccess,
  isPosted = false,
  clientRelation = false,
  setErrorMessage,
  print
}) {
  const [windowInfo, setWindowInfo] = useState(null)
  const [pdfURL, setPdfUrl] = useState(null)
  const [isPrinted, setisPrinted] = useState(false)
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
      {windowToolbarVisible && (
        <WindowToolbar
          print={print}
          onSave={() => form.handleSubmit()}
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
          onPreview={() =>
            stack({
              Component: PreviewReport,
              props: {
                pdfURL: pdfURL
              },
              width: 1000,
              height: 500,
              title: 'Preview Report'
            })
          }
          editMode={editMode}
          disabledSubmit={disabledSubmit}
          infoVisible={infoVisible}
          postVisible={postVisible}
          isPosted={isPosted}
          clientRelation={clientRelation}
          resourceId={resourceId}
          recordId={form.values.recordId}
          setPdfUrl={setPdfUrl}
          pdfURL={pdfURL}
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
