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
  onClose,
  onReopen,
  visibleReopen = false,
  visibleClose = false,
  visiblePost = false,
  visibleApprove = false,
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
      const resetValues = {}; 
      form.resetForm({
        values: resetValues,
      });
      if (form1) {
        const resetValues1 = {}; 
        form1.resetForm({
          values: resetValues1,
        });
      }
      if (setIDInfoAutoFilled) {
        setIDInfoAutoFilled(false);
      }
    
      if (typeof setEditMode === 'function') {
        setEditMode(false);
      }
    }

    function onApproval() {
      stack({
        Component: Approvals,
        props: {
          recordId: form.values.recordId,
          functionId: form.values.functionId
        },
        width: 1000,
        height: 500,
        title: 'Approvals'
      })
    }
    
  return (
    <>
      <DialogContent sx={{ flex: 1, height: '100%', zIndex: 0 }}>{children}</DialogContent>
      {windowToolbarVisible && (
        <WindowToolbar
          print={print}
          onSave={() => form.handleSubmit()}
          onClear={() => handleReset()}
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
          onClose={onClose}
          onReopen={onReopen}
          visibleReopen={visibleReopen}
          visibleClose={visibleClose}
          visiblePost={visiblePost}
          visibleApprove={visibleApprove}
          onApproval={onApproval}
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
