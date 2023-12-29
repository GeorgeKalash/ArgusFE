// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import UsersTab from 'src/pages/users/Tabs/UsersTab'

const UsersWindow = ({
  onClose,
  width,
  height,
  onSave,
  editMode,
  usersValidation,
  labels,
  maxAccess,
  notificationGrpStore,
  languageStore,
  userTypeStore,
  activeStatusStore,
  employeeStore,
  setEmployeeStore,
  lookupEmployee
}) => {
  return (
    <Window
      id='UsersWindow'
      Title={labels.users}
      onClose={onClose}
      width={width}
      height={height}
      onSave={onSave}
      usersValidation={usersValidation}
    >
      <CustomTabPanel>
        <UsersTab
          labels={labels}
          usersValidation={usersValidation}
          maxAccess={maxAccess}
          notificationGrpStore={notificationGrpStore}
          languageStore={languageStore}
          userTypeStore={userTypeStore}
          activeStatusStore={activeStatusStore}
          editMode={editMode}
          employeeStore={employeeStore}
          setEmployeeStore={setEmployeeStore}
          lookupEmployee={lookupEmployee}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default UsersWindow
