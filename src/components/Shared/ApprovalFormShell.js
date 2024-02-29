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
    isClosed,
    editMode,
    hiddenClose = false,
    hiddenPost = false,
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
  const actions = [ { action : onPost , title :'Post', isDisabled: !editMode, isHidden: hiddenPost, color:'#231f20', colorHover:'#4d393e'}, 
                   { action : onClose , title :'Close', isDisabled: isClosed || !editMode, isHidden: hiddenClose, color:'#231f20', colorHover:'#241c1e'}, 
                   { action : onApproval , title :'Approval', isDisabled: !isClosed, isHidden: hiddenClose, color:'#231f20', colorHover:'#4d393e'}   ]

  return (
    <FormShell actions={actions} form={form} isClosed={isClosed} {...remaining}>
      {children}
    </FormShell>
  )
}
