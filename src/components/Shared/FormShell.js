import { Box, DialogContent } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import WindowToolbar from './WindowToolbar'
import TransactionLog from './TransactionLog'
import { TrxType } from 'src/resources/AccessLevels'
import { ClientRelationList } from './ClientRelationList'
import { useGlobalRecord, useWindow } from 'src/windows'
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
import AttachmentList from './AttachmentList'
import { RequestsContext } from 'src/providers/RequestsContext'

function LoadingOverlay() {
  return (
    <Box
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        backgroundColor: 'rgba(250, 250, 250, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    ></Box>
  )
}

export default function FormShell({
  form,
  isSaved = true,
  isInfo = true,
  isCleared = true,
  isSavedClear = true,
  children,
  editMode,
  disabledSubmit,
  disabledSavedClear,
  infoVisible = true,
  postVisible = false,
  resourceId,
  functionId,
  maxAccess,
  isPosted = false,
  isClosed = false,
  clientRelation = false,
  addClientRelation = false,
  previewReport = false,
  onClear,
  previewBtnClicked = () => {},
  setIDInfoAutoFilled,
  visibleClear,
  actions,
  isParentWindow = true
}) {
  const { stack } = useWindow()
  const { clear, open, setRecord } = useGlobalRecord() || {}
  const { platformLabels } = useContext(ControlContext)
  const isSavedClearVisible = isSavedClear && isSaved && isCleared
  const { loading } = useContext(RequestsContext)
  const [showOverlay, setShowOverlay] = useState(false)

  const windowToolbarVisible = editMode
    ? maxAccess < TrxType.EDIT
      ? false
      : true
    : maxAccess < TrxType.ADD
    ? false
    : true

  useEffect(() => {
    if (maxAccess || maxAccess === undefined) {
      if (!loading && editMode) {
        const timer = setTimeout(() => {
          setShowOverlay(true)
        }, 150)

        return () => clearTimeout(timer)
      } else if (!editMode && !loading) {
        const timer = setTimeout(() => {
          setShowOverlay(true)
        }, 50)

        return () => clearTimeout(timer)
      }
    }
  }, [loading, editMode, maxAccess])

  useEffect(() => {
    if (!form?.values?.recordId) {
      return
    }

    if (typeof setRecord !== 'function') {
      return
    }

    const hasMeaningfulValues = Object.entries(form.values).some(
      ([key, value]) => key !== 'recordId' && value !== '' && value !== null && value !== undefined
    )

    if (hasMeaningfulValues) {
      setRecord(form.values.recordId, form.values)
    } else {
      setRecord(form.values.recordId)
    }
  }, [form?.values?.recordId])

  actions?.filter(Boolean)?.forEach(action => {
    if (typeof action?.onClick !== 'function') {
      switch (action?.onClick) {
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
              }
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
              }
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
              }
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
              }
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
                values: form.values,
                recordId: form.values?.recordId,
                functionId: functionId,
                valuesPath: action.valuesPath,
                datasetId: action.datasetId,
                onReset: action?.onReset
              }
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
              }
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
                clientId: form?.values?.header?.clientId || 0
              }
            })
          }
          break
        case 'onClickGIA':
          action.onClick = () => {
            stack({
              Component: GlobalIntegrationGrid,
              props: {
                masterId: form.values?.recordId,
                masterSource: action?.masterSource
              }
            })
          }
          break
        case 'onClickAC':
          action.onClick = () => {
            stack({
              Component: AccountBalance
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
              }
            })
          }
          break
        case 'onClientBalance':
          action.onClick = () => {
            stack({
              Component: ClientBalance,
              props: {
                recordId: form.values?.recordId
              }
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
              }
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
              }
            })
          }
          break
        case 'onClickMetal':
          action.onClick = () => {
            setTimeout(() => {
              stack({
                Component: MetalSummary,
                props: {
                  handleMetalClick: action?.handleMetalClick
                },
                expandable: false
              })
            }, 5)
          }
          break
        case 'onUnpostConfirmation':
          action.onClick = () => {
            stack({
              Component: StrictUnpostConfirmation,
              props: {
                onSuccess: action.onSuccess
              },
              expandable: false
            })
          }
          break
        case 'onClickAttachment':
          action.onClick = () => {
            stack({
              Component: AttachmentList,
              props: {
                recordId: form.values?.recordId,
                resourceId,
                functionId
              }
            })
          }
          break
        default:
          action.onClick = () => console.log(`Action with key ${action.key} has a string onClick handler.`)
          break
      }
    }
  })

  function handleReset() {
    if (typeof onClear === 'function') {
      onClear()
    } else {
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
          position: 'relative',
          '.MuiBox-root': {
            paddingTop: isParentWindow ? '7px !important' : '2px !important',
            px: '0px !important',
            pb: '0px !important'
          }
        }}
      >
        {!showOverlay && LoadingOverlay()}
        {children}
      </DialogContent>
      {windowToolbarVisible && (
        <WindowToolbar
          form={form}
          previewBtnClicked={previewBtnClicked}
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
              }
            })
          }
          isSaved={isSaved}
          isSavedClear={isSavedClearVisible}
          isInfo={isInfo}
          isCleared={isCleared}
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
          recordId={form.values?.recordId}
          previewReport={previewReport}
          visibleClear={visibleClear}
          functionId={functionId}
          maxAccess={maxAccess}
        />
      )}
    </>
  )
}
