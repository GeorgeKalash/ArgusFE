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
      height: 500,
      title: 'Approvals'
    })
  }

  const actions = [
    {
      action: onPost,
      title: 'Post',
      isDisabled: !editMode,
      isHidden: hiddenPost,
      color: '#231f20',
      colorHover: '#4d393e'
    },
    {
      action: onClose,
      title: 'Close',
      isDisabled: isClosed || !editMode,
      isHidden: hiddenClose,
      color: '#231f20',
      colorHover: '#241c1e'
    },
    { action: onReopen, title: 'reopen', isDisabled: !isClosed || !editMode, isHidden: hiddenReopen },
    {
      action: onApproval,
      title: 'Approval',
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
      {...remaining}
    >
      {children}
    </FormShell>
  )
}
