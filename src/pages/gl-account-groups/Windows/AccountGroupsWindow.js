import Window from 'src/components/Shared/Window'
import AccountGroupsForm from '../forms/AccountGroupsForm'

const AccountGroupsWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
      id='AccountGroupsWindow'
      Title={labels.accountGroup}
      controlled={true}
      onClose={onClose}
      width={500}
      height={300}
    >
      <AccountGroupsForm
        labels={labels}
        maxAccess={maxAccess}
        recordId={recordId}
      />
    </Window>
  )
}

export default AccountGroupsWindow
