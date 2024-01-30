// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import UsersTab from 'src/pages/users/Tabs/UsersTab'
import DefaultsTab from 'src/pages/users/Tabs/DefaultsTab'
import SecurityGrpTab from 'src/pages/users/Tabs/SecurityGrpTab'
import RowAccessTab from 'src/pages/users/Tabs/RowAccessTab'

const UsersWindow = ({
  tabs,
  activeTab,
  setActiveTab,
  onClose,
  width,
  height,
  onSave,
  editMode,
  labels,
  maxAccess,

  //users tab
  usersValidation,
  notificationGrpStore,
  languageStore,
  userTypeStore,
  activeStatusStore,
  employeeStore,
  setEmployeeStore,
  lookupEmployee, 
  checkFieldDirect,
  emailPresent,
  passwordState,
  setPasswordState,

  //defaults tab
  defaultsValidation,
  siteStore,
  plantStore,
  salesPersonStore,
  setCashAccStore,
  cashAccStore,
  lookupCashAcc,

  //security group tab
  securityGrpGridData,
  getSecurityGrpGridData,
  addSecurityGrp,
  delSecurityGrp,
  popupSecurityGrp,

  //Row access tab
  rowAccessValidation,
  moduleStore,
  handleRowAccessSubmit,
  rowColumns,
  getRowAccessGridData,
  rowGridData
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
      tabs={tabs}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <CustomTabPanel index={0} value={activeTab}>
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
          checkFieldDirect={checkFieldDirect}
          emailPresent={emailPresent}
          passwordState={passwordState}
          setPasswordState={setPasswordState}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <DefaultsTab
          labels={labels}
          maxAccess={maxAccess}
          defaultsValidation={defaultsValidation}
          siteStore={siteStore}
          plantStore={plantStore}
          salesPersonStore={salesPersonStore}
          setCashAccStore={setCashAccStore}
          cashAccStore={cashAccStore}
          lookupCashAcc={lookupCashAcc}>
          </DefaultsTab>
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <SecurityGrpTab
          securityGrpGridData={securityGrpGridData}
          getSecurityGrpGridData={getSecurityGrpGridData}
          addSecurityGrp={addSecurityGrp}
          delSecurityGrp={delSecurityGrp}
          popupSecurityGrp={popupSecurityGrp}
          labels={labels}
          maxAccess={maxAccess}
        />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab}>
        <RowAccessTab
         labels={labels}
         moduleStore={moduleStore}
         handleRowAccessSubmit={handleRowAccessSubmit}
         getRowAccessGridData={getRowAccessGridData}
         rowAccessValidation={rowAccessValidation}
         rowGridData={rowGridData}
         rowColumns={rowColumns}
         maxAccess={maxAccess}
        />
      </CustomTabPanel>
    </Window>
  )
}

export default UsersWindow
