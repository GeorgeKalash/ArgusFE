import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import GroupInfoTab from 'src/pages/security-groups/Tabs/GroupInfoTab'
import SGUsersTab from 'src/pages/security-groups/Tabs/SGUsersTab'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'

const GroupInfoWindow = ({ labels, maxAccess, recordId, height }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [storeRecordId, setRecordId] = useState(recordId)
  const tabs = [{ label: labels?.groupInfo }, { label: labels?.users, disabled: !storeRecordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel height={height} index={0} value={activeTab}>
        <GroupInfoTab labels={labels} maxAccess={maxAccess} storeRecordId={storeRecordId} setRecordId={setRecordId} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <SGUsersTab maxAccess={maxAccess} labels={labels} storeRecordId={storeRecordId} setRecordId={setRecordId} />
      </CustomTabPanel>
    </>
  )
}

export default GroupInfoWindow
