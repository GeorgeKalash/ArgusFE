import { useContext, useEffect } from 'react'
import TransactionLog from './TransactionLog'
import { ClientRelationList } from './ClientRelationList'
import { useGlobalRecord, useWindow } from '@argus/shared-providers/src/providers/windows'
import GeneralLedger from '@argus/shared-ui/src/components/Shared/GeneralLedger'
import Approvals from './Approvals'
import ResourceRecordRemarks from './ResourceRecordRemarks'
import GlobalIntegrationGrid from './GlobalIntegrationGrid'
import AccountBalance from './AccountBalance'
import CashTransaction from './CashTransaction'
import FinancialTransaction from './FinancialTransaction'
import Aging from './Aging'
import MetalSummary from './MetalSummary'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { ClientRelationForm } from './ClientRelationForm'
import { ClientBalance } from './ClientBalance'
import InventoryTransaction from './InventoryTransaction'
import SalesTrxForm from './SalesTrxForm'
import StrictUnpostConfirmation from './StrictUnpostConfirmation'
import ClientSalesTransaction from './ClientSalesTransaction'
import AttachmentList from './AttachmentList'
import { useError } from '@argus/shared-providers/src/providers/error'
import Form from './Form'
import StrictConfirmation from './StrictConfirmation'

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
  postVisible = false,
  resourceId,
  functionId,
  maxAccess,
  isPosted = false,
  isClosed = false,
  previewReport = false,
  onClear,
  previewBtnClicked = () => {},
  setIDInfoAutoFilled,
  actions,
  isParentWindow = true,
  onPrint = false,
  fullSize = false,
  reportSize
}) {
  const { stack } = useWindow()
  const { clear, open, setRecord } = useGlobalRecord() || {}
  const { platformLabels } = useContext(ControlContext)
  const isSavedClearVisible = isSavedClear && isSaved && isCleared

  const { stack: stackError } = useError()

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
            if (action.error) {
              stackError(action.error)

              return
            }
            stack({
              Component: GeneralLedger,
              props: {
                values: action.values || form.values,
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
        case 'onCloseConfirmation':
          action.onClick = () => {
            stack({
              Component: StrictConfirmation,
              props: {
                action: action.action,
                type: 'close'
              },
              expandable: false
            })
          }
          break
        case 'onOpenConfirmation':
          action.onClick = () => {
            stack({
              Component: StrictConfirmation,
              props: {
                action: action.action,
                type: 'open'
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
    <Form
      form={form}
      previewBtnClicked={previewBtnClicked}
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
      postVisible={postVisible}
      isPosted={isPosted}
      isClosed={isClosed}
      resourceId={resourceId}
      recordId={form?.values?.recordId}
      previewReport={previewReport}
      functionId={functionId}
      maxAccess={maxAccess}
      isParentWindow={isParentWindow}
      onPrint={onPrint}
      fullSize={fullSize}
      reportSize={reportSize}
    >
      {children}
    </Form>
  )
}
