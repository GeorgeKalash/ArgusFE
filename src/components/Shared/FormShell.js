import { DialogContent } from '@mui/material'
import { useContext, useState } from 'react'
import WindowToolbar from './WindowToolbar'
import TransactionLog from './TransactionLog'
import { TrxType } from 'src/resources/AccessLevels'
import { ClientRelationList } from './ClientRelationList'
import { useGlobalRecord, useWindow } from 'src/windows'
import PreviewReport from './PreviewReport'
import GeneralLedger from 'src/components/Shared/GeneralLedger'
import Approvals from './Approvals'
import ResourceRecordRemarks from './ResourceRecordRemarks'
import GlobalIntegrationGrid from './GlobalIntegrationGrid'
import AccountBalance from './AccountBalance'
import CashTransaction from './CashTransaction'
import FinancialTransaction from './FinancialTransaction'
import { ControlContext } from 'src/providers/ControlContext'
import { ClientRelationForm } from './ClientRelationForm'

export default function FormShell({
  form,
  isSaved = true,
  isInfo = true,
  isCleared = true,
  children,
  editMode,
  disabledSubmit,
  infoVisible = true,
  postVisible = false,
  resourceId,
  masterSource,
  functionId,
  maxAccess,
  isPosted = false,
  isClosed = false,
  clientRelation = false,
  addClientRelation = false,
  setErrorMessage,
  previewReport = false,
  setIDInfoAutoFilled,
  visibleClear,
  actions
}) {
  const { stack } = useWindow()
  const [selectedReport, setSelectedReport] = useState(null)
  const { clear } = useGlobalRecord()
  const { platformLabels } = useContext(ControlContext)

  const windowToolbarVisible = editMode
    ? maxAccess < TrxType.EDIT
      ? false
      : true
    : maxAccess < TrxType.ADD
    ? false
    : true

  function handleReset() {
    if (!form.values?.recordId) {
      form.resetForm({
        values: form.initialValues
      })
    } else {
      if (typeof clear === 'function') {
        clear()
      }
    }

    if (setIDInfoAutoFilled) {
      setIDInfoAutoFilled(false)
    }
  }

  function onApproval() {
    stack({
      Component: Approvals,
      props: {
        recordId: form.values.recordIdRemittance ?? form.values.recordId,
        functionId: form.values.functionId ?? functionId
      },
      width: 1000,
      height: 500,
      title: platformLabels.Approvals
    })
  }

  function onRecordRemarks() {
    stack({
      Component: ResourceRecordRemarks,
      props: {
        recordId: form.values?.recordId,
        resourceId: resourceId
      },
      width: 800,
      height: 500,
      title: platformLabels.ResourceRecordRemarks
    })
  }

  const transactionClicked = () => {
    stack({
      Component: CashTransaction,
      props: {
        recordId: form.values?.recordId,
        functionId: functionId
      },
      width: 1200,
      height: 670,
      title: platformLabels,
      CashTransaction
    })
  }

  return (
    <>
      <DialogContent
        sx={{
          display: 'flex !important',
          flex: 1,
          flexDirection: 'column',
          overflow: 'auto',
          '.MuiBox-root': {
            paddingTop: '5px !important',
            px: '0px !important'
          }
        }}
      >
        {children}
      </DialogContent>
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
              height: 600,
              title: platformLabels.TransactionLog
            })
          }
          onClickGL={() =>
            stack({
              Component: GeneralLedger,
              props: {
                formValues: form.values,
                recordId: form.values?.recordId,
                functionId: functionId
              },
              width: 1000,
              height: 620,
              title: platformLabels.GeneralLedger
            })
          }
          onClickIT={() =>
            stack({
              Component: FinancialTransaction,
              props: {
                formValues: form.values,
                functionId
              },
              width: 1000,
              height: 620,
              title: platformLabels.financialTransaction
            })
          }
          onClickGIA={() =>
            stack({
              Component: GlobalIntegrationGrid,
              props: {
                masterId: form.values?.recordId,
                masterSource: masterSource
              },
              width: 700,
              height: 500,
              title: platformLabels.IntegrationAccount
            })
          }
          onClickAC={() =>
            stack({
              Component: AccountBalance,
              width: 1000,
              height: 620,
              title: platformLabels.AccountBalance
            })
          }
          onClientRelation={() =>
            stack({
              Component: ClientRelationList,
              props: {
                recordId: form.values?.recordId ?? form.values.clientId,
                name: form.values.firstName ? form.values.firstName + ' ' + form.values.lastName : form.values.name,
                reference: form.values.reference
              },
              width: 900,
              height: 600,
              title: platformLabels.ClientRelation
            })
          }
          onAddClientRelation={() =>
            stack({
              Component: ClientRelationForm,
              props: {
                clientId: form.values?.recordId ?? form.values.clientId,
                name: form.values.firstName ? form.values.firstName + ' ' + form.values.lastName : form.values.name,
                reference: form.values.reference,
                formValidation: form
              },
              width: 500,
              height: 420,
              title: platformLabels.addClientRelation
            })
          }
          onGenerateReport={() =>
            stack({
              Component: PreviewReport,
              props: {
                selectedReport: selectedReport,
                recordId: form.values?.recordId
              },
              width: 1150,
              height: 700,
              title: platformLabels.PreviewReport
            })
          }
          isSaved={isSaved}
          isInfo={isInfo}
          isCleared={isCleared}
          actions={actions}
          onApproval={onApproval}
          onRecordRemarks={onRecordRemarks}
          transactionClicked={transactionClicked}
          editMode={editMode}
          disabledSubmit={disabledSubmit}
          infoVisible={infoVisible}
          postVisible={postVisible}
          isPosted={isPosted}
          isClosed={isClosed}
          clientRelation={clientRelation}
          addClientRelation={addClientRelation}
          resourceId={resourceId}
          masterSource={masterSource}
          recordId={form.values?.recordId}
          selectedReport={selectedReport}
          setSelectedReport={setSelectedReport}
          previewReport={previewReport}
          visibleClear={visibleClear}
          functionId={functionId}
        />
      )}
    </>
  )
}
