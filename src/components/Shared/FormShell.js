import { DialogContent, Box } from '@mui/material'
import { useState } from 'react'
import WindowToolbar from './WindowToolbar'
import TransactionLog from './TransactionLog'
import { TrxType } from 'src/resources/AccessLevels'
import { ClientRelationForm } from './ClientRelationForm'
import { useWindow } from 'src/windows'
import PreviewReport from './PreviewReport'
import GeneralLedger from 'src/components/Shared/GeneralLedger'
import Approvals from './Approvals'

export default function FormShell({
  form,
  isSaved = true,
  isInfo = true,
  isCleared = true,
  children,
  editMode,
  setEditMode,
  disabledSubmit,
  infoVisible = true,
  postVisible = false,
  resourceId,
  functionId,
  NewComponentVisible = false,
  maxAccess,
  isPosted = false,
  isClosed = false,
  clientRelation = false,
  setErrorMessage,
  previewReport = false,
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
    form.resetForm({
      values: form.initialValues
    })

    if (setIDInfoAutoFilled) {
      setIDInfoAutoFilled(false)
    }

    if (typeof setEditMode === 'function') {
      setEditMode(false)
    }
  }

  function onApproval() {
    stack({
      Component: Approvals,
      props: {
        recordId: form.values.recordId,
        functionId: form.values.functionId ?? functionId
      },
      width: 1000,
      height: 500,
      title: 'Approvals'
    })
  }

  return (
    <>
      <DialogContent sx={{ flex: 1, height: '100%', zIndex: 0  }}><Box sx={{mt:1}}>{children}</Box></DialogContent>
      {windowToolbarVisible && (
        <WindowToolbar
          print={print}
          onSave={() => form?.handleSubmit()}
          onClear={() => handleReset()}
          onPost={() => {
            // Set a flag in thexpt Formik state before calling handleSubmit
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
              height: 'auto',
              title: 'Transaction Log'
            })
          }
          newHandler={() =>
            stack({
              Component: GeneralLedger,
              props: {
                formValues: form.values,

                recordId: form.values?.recordId,
                functionId: functionId
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
          isSaved={isSaved}
          isInfo={isInfo}
          isCleared={isCleared}
          actions={actions}
          onApproval={onApproval}
          editMode={editMode}
          disabledSubmit={disabledSubmit}
          infoVisible={infoVisible}
          NewComponentVisible={NewComponentVisible}
          postVisible={postVisible}
          isPosted={isPosted}
          isClosed={isClosed}
          clientRelation={clientRelation}
          resourceId={resourceId}
          recordId={form.values?.recordId}
          selectedReport={selectedReport}
          setSelectedReport={setSelectedReport}
          previewReport={previewReport}
          visibleClear={visibleClear}
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
