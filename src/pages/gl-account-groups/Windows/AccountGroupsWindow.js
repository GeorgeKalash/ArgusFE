import Window from 'src/components/Shared/Window'
import AccountGroupsForm from '../forms/AccountGroupsForm'

const AccountGroupsWindow = ({ onClose, labels, maxAccess, recordId }) => {
  return (
    <Window
      id='AccountGroupsWindow'
      Title={labels.accountGroup}
      height={350}
      width={500}
      controlled={true}
      onClose={onClose}
    >
      <AccountGroupsForm labels={labels} maxAccess={maxAccess} recordId={recordId} />
    </Window>
  )
}

export default AccountGroupsWindow
