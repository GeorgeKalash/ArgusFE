// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import GroupInfoTab from 'src/pages/security-groups/Tabs/GroupInfoTab'
import UsersTab from 'src/pages/security-groups/Tabs/UsersTab'

const GroupInfoWindow = ({
  onClose,
  width,
  height,
  onSave,
  labels,
  maxAccess,
  tabs,
  activeTab,
  setActiveTab,

  //group info tab
  groupInfoValidation,

  //users tab
  usersValidation,
  usersGridData,
  getUsersGridData,
  delUsers,
  addUsers,
}) => {
  return (
    <Window
      id='GroupInfoWindow'
      Title={labels.groupInfo}
      onClose={onClose}
      width={width}
      height={height}
      onSave={onSave}
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <CustomTabPanel index={0} value={activeTab}>
        <GroupInfoTab
          labels={labels}
          groupInfoValidation={groupInfoValidation}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <UsersTab
          labels={labels}
          usersValidation={usersValidation}
          maxAccess={maxAccess}
          usersGridData={usersGridData}
          getUsersGridData={getUsersGridData}
          delUsers={delUsers}
          addUsers={addUsers}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default GroupInfoWindow
