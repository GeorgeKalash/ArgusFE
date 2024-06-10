import { useWindow } from 'src/windows'
import FormShell from './FormShell'
import { Approval } from '@mui/icons-material'
import Approvals from './Approvals'

export default function ApprovalFormShell(props) {
  const {
    children,
    form,
    onPost,
    onClose,
    onReopen,
    isClosed,
    editMode,
    onTFR,
    isTFR,
    NewComponentVisible = false,
    functionId,
    hiddenClose = false,
    hiddenApprove = false,
    hiddenReopen = false,
    hiddenPost = false,
    visibleTFR = false,
    ...remaining
  } = props
  const { stack } = useWindow()

  function onApproval() {
    stack({
      Component: Approvals,
      props: {
        recordId: form.values.recordId,
        functionId: form.values.functionId
      },
      width: 1000,
      title: 'Approvals'
    })
  }

  const actions = [
    {
      action: onPost,
      title: 'post',
      isDisabled: !editMode,
      isHidden: hiddenPost,
      color: '#231f20',
      colorHover: '#4d393e'
    },
    {
      action: onClose,
      title: 'close',
      isDisabled: isClosed || !editMode,
      isHidden: hiddenClose,
      color: 'transparent',
      colorHover: 'transparent',
      border: '1px solid #01a437'
    },
    {
      action: onReopen,
      title: 'reopen',
      isDisabled: !isClosed || !editMode,
      isHidden: hiddenReopen,
      color: 'transparent',
      colorHover: 'transparent',
      border: '1px solid #000000'
    },
    {
      action: onApproval,
      title: 'approval',
      isDisabled: !isClosed,
      isHidden: hiddenApprove,
      color: '#231f20',
      colorHover: '#080707'
    }
  ]

  return (
    <FormShell
      actions={actions}
      form={form}
      isClosed={isClosed}
      editMode={editMode}
      visibleTFR={visibleTFR}
      onTFR={onTFR}
      isTFR={isTFR}
      functionId={functionId}
      NewComponentVisible={NewComponentVisible}
      {...remaining}
    >
      {children}
    </FormShell>
  )
}
