import { DialogContent, Box } from '@mui/material'
import { useState } from 'react'
import WindowToolbar from './WindowToolbar'
import TransactionLog from './TransactionLog'
import { TrxType } from 'src/resources/AccessLevels'
import { ClientRelationForm } from './ClientRelationForm'
import { useWindow } from 'src/windows'
import PreviewReport from './PreviewReport'
import GeneralLedger from 'src/components/Shared/GeneralLedger'

export default function FormShell({
  form,
  form1,
  children,
  editMode,
  setEditMode,
  disabledSubmit,
  infoVisible = true,
  postVisible = false,
  closeVisible = false,
  resourceId,
  functionId,
  recordId,
  NewComponentVisible = false,
  maxAccess,
  isPosted = false,
  isTFR = false,
  isClosed = false,
  clientRelation = false,
  setErrorMessage,
  previewReport = false,
  visibleTFR = false,
  initialValues,
  initialValues1,
  setIDInfoAutoFilled,
  visibleClear,
  actions
}) {
  const [windowInfo, setWindowInfo] = useState(null)
  const { stack } = useWindow()
  const [selectedReport, setSelectedReport] = useState(null)

  const windowToolbarVisible = editMode
    ? maxAccess < TrxType.EDIT
      ? false
      : true
    : maxAccess < TrxType.ADD
    ? false
    : true

  function handleReset() {
    initialValues && form.setValues(initialValues)
    if (form1) {
      form1.setValues(initialValues1)
    }
    if (setIDInfoAutoFilled) {
      setIDInfoAutoFilled(false)
    }
    setEditMode(false)
  }

  return (
    <>
      <DialogContent sx={{ flex: 1, height: '100%', zIndex: 0 }}>{children}</DialogContent>
      {windowToolbarVisible && (
        <WindowToolbar
          print={print}
          onSave={() => form.handleSubmit()}
          onClear={() => (initialValues ? handleReset() : false)}
          onPost={() => {
            // Set a flag in the Formik state before calling handleSubmit
            form.setFieldValue('isOnPostClicked', true)
            form.handleSubmit()
          }}
          onTFR={() => {
            // Set  flag in the Formik state before calling handleSubmit
            form.setFieldValue('isTFRClicked', true)
            form.handleSubmit()
          }}
          onInfo={() =>
            stack({
              Component: TransactionLog,
              props: {
                recordId: form.values?.recordId ?? form.values.clientId,
                resourceId: resourceId,
                setErrorMessage: setErrorMessage
              },
              width: 700,
              height: 400,
              title: 'Transaction Log'
            })
          }
          newHandler={() =>
            stack({
              Component: GeneralLedger,
              props: {
                formValues: form.values,
                recordId: form.values?.recordId,
                functionId:functionId
              },
              width: 1000,
              height: 600,
              title: 'General Ledger'
            })
          }
          onClientRelation={() =>
            stack({
              Component: ClientRelationForm,
              props: {
                recordId: form.values?.recordId ?? form.values.clientId,
                name: form.values.firstName ? form.values.firstName + ' ' + form.values.lastName : form.values.name,
                reference: form.values.reference,
                setErrorMessage: setErrorMessage
              },
              width: 900,
              height: 600,
              title: 'Client Relation'
            })
          }
          onGenerateReport={() =>
            stack({
              Component: PreviewReport,
              props: {
                selectedReport: selectedReport,
                recordId: form.values?.recordId
              },
              width: 1000,
              height: 500,
              title: 'Preview Report'
            })
          }
          actions={actions}
          editMode={editMode}
          disabledSubmit={disabledSubmit}
          infoVisible={infoVisible}
          NewComponentVisible={NewComponentVisible}
          postVisible={postVisible}
          closeVisible={closeVisible}
          visibleTFR={visibleTFR}
          isPosted={isPosted}
          isTFR={isTFR}
          isClosed={isClosed}
          clientRelation={clientRelation}
          resourceId={resourceId}
          recordId={form.values?.recordId}
          selectedReport={selectedReport}
          setSelectedReport={setSelectedReport}
          previewReport={previewReport}
          visibleClear={visibleClear}
          functionId={functionId}
        />
      )}
      {windowInfo && (
        <TransactionLog
          resourceId={resourceId}
          onInfoClose={() => setWindowInfo(false)}
          recordId={form.values?.recordId}
        />
      )}
    </>
  )
}
