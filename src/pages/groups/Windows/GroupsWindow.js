import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import GroupsForm from '../forms/GroupsForm'

const GroupsWindow = ({
  onClose,
  labels,
  maxAccess,
  recordId
}) => {
  
  return (
    <Window
      id='Groups'
      Title={labels.bpGroups}
      controlled={true}
      onClose={onClose}
    >
        <GroupsForm
          labels={labels}
          maxAccess={maxAccess}
          recordId={recordId}
        />
    </Window>
  )
}

export default GroupsWindow