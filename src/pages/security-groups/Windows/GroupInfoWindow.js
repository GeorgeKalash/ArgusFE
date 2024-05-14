import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import GroupInfoTab from 'src/pages/security-groups/Tabs/GroupInfoTab'
import SGUsersTab from 'src/pages/security-groups/Tabs/SGUsersTab'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'

const GroupInfoWindow = ({ labels, maxAccess, recordId, height }) => {
  const [activeTab, setActiveTab] = useState(0)

  const tabs = [{ label: labels?.groupInfo }, { label: labels?.users, disabled: !recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel height={height} index={0} value={activeTab}>
        <GroupInfoTab labels={labels} maxAccess={maxAccess} recordId={recordId} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <SGUsersTab recordId={recordId} maxAccess={maxAccess} labels={labels} />
      </CustomTabPanel>
    </>
  )
}

export default GroupInfoWindow
