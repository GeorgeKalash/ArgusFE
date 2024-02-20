
import { useWindow } from 'src/windows';
import FormShell from './FormShell'
import { Approval } from '@mui/icons-material';
import Approvals from './Approvals';

export default function ApprovalFormShell(props) {
  const {	children, form, ...remaining } = props;
  const { stack } = useWindow()

  function onPost(){

  }
  function onClose(){

  }
  function onApproval(){

      stack({
        Component: Approvals,
        props: {
          recordId: form.values.recordId ,
          functionId: form.values.functionId
        },
        width: 1000,
        height: 500,
        title: 'Approvals'
      })


  }

  const actions = [ { action : onPost , title :'Post'}, { action : onClose , title :'Close'}, { action : onApproval , title :'Approval'}   ]

  return (

    <FormShell actions={actions} form={form} {...remaining}>{children}</FormShell>

  )
}
