import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import UsersTab from 'src/pages/users/Tabs/UsersTab'
import DefaultsTab from 'src/pages/users/Tabs/DefaultsTab'
import SecurityGrpTab from 'src/pages/users/Tabs/SecurityGrpTab'
import RowAccessTab from 'src/pages/users/Tabs/RowAccessTab'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'

const UsersWindow = ({ labels, maxAccess, recordId }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [storeRecordId, setRecordId] = useState(recordId)

  const tabs = [
    { label: labels.users },
    { label: labels.defaults, disabled: !storeRecordId },
    { label: labels.securityGroups, disabled: !storeRecordId },
    { label: labels.rowAccess, disabled: !storeRecordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <UsersTab labels={labels} maxAccess={maxAccess} storeRecordId={storeRecordId} setRecordId={setRecordId} />
      </CustomTabPanel>

      <CustomTabPanel index={1} value={activeTab}>
        <DefaultsTab labels={labels} maxAccess={maxAccess} storeRecordId={storeRecordId}></DefaultsTab>
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <SecurityGrpTab labels={labels} maxAccess={maxAccess} storeRecordId={storeRecordId} />
      </CustomTabPanel>
      {/*<CustomTabPanel index={3} value={activeTab}>
        <RowAccessTab labels={labels} maxAccess={maxAccess} storeRecordId={storeRecordId} />
  </CustomTabPanel>*/}
    </>
  )
}

export default UsersWindow
