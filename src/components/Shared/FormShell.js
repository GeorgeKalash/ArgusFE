import { DialogContent } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
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
import Aging from './Aging'
import MetalSummary from './MetalSummary'
import { ControlContext } from 'src/providers/ControlContext'
import { ClientRelationForm } from './ClientRelationForm'
import { ClientBalance } from './ClientBalance'
import InventoryTransaction from './InventoryTransaction'
import SalesTrxForm from './SalesTrxForm'
import StrictUnpostConfirmation from './StrictUnpostConfirmation'
import ClientSalesTransaction from './ClientSalesTransaction'

export default function FormShell({
  form,
  isSaved = true,
  isInfo = true,
  isCleared = true,
  isSavedClear = true,
  isGenerated = false,
  children,
  editMode,
  disabledSubmit,
  disabledSavedClear,
  infoVisible = true,
  postVisible = false,
  resourceId,
  masterSource,
  onGenerate,
  functionId,
  maxAccess,
  isPosted = false,
  isClosed = false,
  clientRelation = false,
  addClientRelation = false,
  previewReport = false,
  previewBtnClicked = () => {},
  setIDInfoAutoFilled,
  visibleClear,
  actions,
  filteredItems = []
}) {
  const { stack } = useWindow()
  const [selectedReport, setSelectedReport] = useState(null)
  const { clear, open } = useGlobalRecord() || {}
  const { platformLabels } = useContext(ControlContext)
  const isSavedClearVisible = isSavedClear && isSaved && isCleared

  const windowToolbarVisible = editMode
    ? maxAccess < TrxType.EDIT
      ? false
      : true
    : maxAccess < TrxType.ADD
    ? false
    : true

  useEffect(() => {
    if (actions) {
      actions.forEach(action => {
        if (typeof action.onClick === 'string') {
          switch (action.onClick) {
            case 'onRecordRemarks':
              action.onClick = () => {
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
              break
            case 'onApproval':
              action.onClick = () => {
                stack({
                  Component: Approvals,
                  props: {
                    recordId: form.values.remittanceRecordId ?? form.values.recordId,
                    functionId: form.values.functionId ?? functionId
                  },
                  width: 1000,
                  height: 500,
                  title: platformLabels.Approvals
                })
              }
              break
            case 'transactionClicked':
              action.onClick = () => {
                stack({
                  Component: CashTransaction,
                  props: {
                    recordId: form.values?.recordId,
                    functionId: functionId
                  },
                  width: 1200,
                  height: 670,
                  title: platformLabels.CashTransaction
                })
              }
              break
            case 'onClientSalesTransaction':
              action.onClick = () => {
                stack({
                  Component: ClientSalesTransaction,
                  props: {
                    functionId: functionId,
                    clientId: form?.values?.header?.clientId
                  },
                  width: 600,
                  height: 450,
                  title: platformLabels.ClientSalesTransaction
                })
              }

              break
            case 'onInventoryTransaction':
              action.onClick = () => {
                stack({
                  Component: InventoryTransaction,
                  props: {
                    recordId: form.values.recordId,
                    functionId: functionId
                  },
                  width: 1000,
                  title: platformLabels.InventoryTransaction
                })
              }

              break
            case 'onPost':
              action.onClick = () => {
                form.setFieldValue('isOnPostClicked', true)
                form.handleSubmit()
              }
              break
            case 'onTFR':
              action.onClick = () => {
                form.setFieldValue('isTFRClicked', true)
                form.handleSubmit()
              }
              break
            case 'onClickGL':
              action.onClick = () => {
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
              break
            case 'onClickIT':
              action.onClick = () => {
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
              break
            case 'onClickSATRX':
              action.onClick = () => {
                stack({
                  Component: SalesTrxForm,
                  props: {
                    recordId: form.values?.recordId,
                    functionId: functionId,
                    itemId: 0,
                    clientId: form?.values?.header?.clientId
                  },
                  width: 1200,
                  title: platformLabels.SalesTransactions
                })
              }
              break
            case 'onClickGIA':
              action.onClick = () => {
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
              break
            case 'onClickAC':
              action.onClick = () => {
                stack({
                  Component: AccountBalance,
                  width: 1000,
                  height: 620,
                  title: platformLabels.AccountBalance
                })
              }
              break
            case 'onClientRelation':
              action.onClick = () => {
                stack({
                  Component: ClientRelationList,
                  props: {
                    recordId: form.values?.recordId ?? form.values.clientId,
                    name: form.values.firstName ? form.values.firstName + ' ' + form.values.lastName : form.values.name,
                    reference: form.values.reference,
                    category: form.values.category
                  },
                  width: 900,
                  height: 600,
                  title: platformLabels.ClientRelation
                })
              }
              break
            case 'onClientBalance':
              action.onClick = () => {
                stack({
                  Component: ClientBalance,
                  props: {
                    recordId: form.values?.recordId
                  },
                  width: 500,
                  height: 350,
                  title: platformLabels.ClientBalance
                })
              }
              break
            case 'onAddClientRelation':
              action.onClick = () => {
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
              break
            case 'onGenerateReport':
              action.onClick = () => {
                stack({
                  Component: PreviewReport,
                  props: {
                    selectedReport: selectedReport,
                    recordId: form.values?.recordId,
                    functionId: form.values?.functionId,
                    resourceId: resourceId,
                    scId: form.values?.stockCountId,
                    siteId: form.values?.siteId,
                    onSuccess: previewBtnClicked
                  },
                  width: 1150,
                  height: 700,
                  title: platformLabels.PreviewReport
                })
              }
              break
            case 'onClickAging':
              action.onClick = () => {
                stack({
                  Component: Aging,
                  props: {
                    recordId: form.values?.recordId,
                    functionId
                  },
                  width: 1000,
                  height: 620,
                  title: platformLabels.Aging
                })
              }
              break
            case 'onClickMetal':
              action.onClick = () => {
                stack({
                  Component: MetalSummary,
                  props: {
                    filteredItems
                  },
                  width: 600,
                  height: 550,
                  title: platformLabels.Metals,
                  expandable: false
                })
              }
              break
            case 'onUnpostConfirmation':
              action.onClick = () => {
                stack({
                  Component: StrictUnpostConfirmation,
                  props: {
                    onSuccess: action.onSuccess
                  },
                  width: 500,
                  height: 300,
                  expandable: false,
                  title: platformLabels.UnpostConfirmation
                })
              }
              break
            case 'onClickAging':
              action.onClick = () => {
                stack({
                  Component: Aging,
                  props: {
                    recordId: form.values?.recordId,
                    functionId
                  },
                  width: 1000,
                  height: 620,
                  title: platformLabels.Aging
                })
              }
              break
            case 'onClickMetal':
              action.onClick = () => {
                stack({
                  Component: MetalSummary,
                  props: {
                    filteredItems
                  },
                  width: 600,
                  height: 550,
                  title: platformLabels.Metals,
                  expandable: false
                })
              }
              break
            default:
              action.onClick = () => console.log(`Action with key ${action.key} has a string onClick handler.`)
              break
          }
        }
      })
    }
  }, [actions])

  function handleReset() {
    if (typeof form.values?.recordId === 'undefined') {
      form.resetForm({
        values: form.initialValues
      })
    } else {
      if (typeof clear === 'function') {
        clear()
      } else {
        form.resetForm({
          values: form.initialValues
        })
      }
    }
    if (setIDInfoAutoFilled) {
      setIDInfoAutoFilled(false)
    }
  }

  async function handleSaveAndClear() {
    const errors = await form.validateForm()
    await form.submitForm()
    if (Object.keys(errors).length == 0) {
      await performPostSubmissionTasks()
    }
  }

  const performPostSubmissionTasks = async () => {
    if (typeof open === 'function') {
      await open()
    }
    handleReset()
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
          onSave={() => {
            form?.handleSubmit()
          }}
          onSaveClear={() => {
            handleSaveAndClear()
          }}
          onClear={() => handleReset()}
          onInfo={() =>
            stack({
              Component: TransactionLog,
              props: {
                recordId: form.values?.recordId ?? form.values.clientId,
                resourceId: resourceId
              },
              width: 900,
              height: 600,
              title: platformLabels.TransactionLog
            })
          }
          onGenerateReport={() =>
            stack({
              Component: PreviewReport,
              props: {
                selectedReport: selectedReport,
                recordId: form.values?.recordId,
                functionId: form.values?.functionId,
                resourceId: resourceId,
                scId: form.values?.stockCountId,
                siteId: form.values?.siteId,
                onSuccess: previewBtnClicked
              },
              width: 1150,
              height: 700,
              title: platformLabels.PreviewReport
            })
          }
          isSaved={isSaved}
          isSavedClear={isSavedClearVisible}
          onGenerate={onGenerate}
          isInfo={isInfo}
          isCleared={isCleared}
          isGenerated={isGenerated}
          actions={actions}
          editMode={editMode}
          disabledSubmit={disabledSubmit}
          disabledSavedClear={disabledSavedClear || disabledSubmit}
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
