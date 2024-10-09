import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import GroupInfoTab from 'src/pages/security-groups/Tabs/GroupInfoTab'
import SGUsersTab from 'src/pages/security-groups/Tabs/SGUsersTab'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import SGAccessLevelTab from '../Tabs/SGAccessLevelTab'
import ReleaseCodeTab from '../Tabs/ReleaseCodeTab'
import RowAccessTab from '../Tabs/RowAccessTab'

const GroupInfoWindow = ({ labels, maxAccess, recordId, height }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [storeRecordId, setRecordId] = useState(recordId)

  const tabs = [
    { label: labels?.groupInfo },
    { label: labels?.users, disabled: !storeRecordId },
    { label: labels?.accessLevel, disabled: !storeRecordId },
    { label: labels?.rowAccess, disabled: !storeRecordId },
    { label: labels?.releaseCode, disabled: !storeRecordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel height={height} index={0} value={activeTab}>
        <GroupInfoTab labels={labels} maxAccess={maxAccess} storeRecordId={storeRecordId} setRecordId={setRecordId} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <SGUsersTab maxAccess={maxAccess} labels={labels} storeRecordId={storeRecordId} />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <SGAccessLevelTab maxAccess={maxAccess} labels={labels} storeRecordId={storeRecordId} />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab}>
        <RowAccessTab maxAccess={maxAccess} labels={labels} recordId={storeRecordId} />
      </CustomTabPanel>
      <CustomTabPanel index={4} value={activeTab}>
        <ReleaseCodeTab maxAccess={maxAccess} labels={labels} recordId={storeRecordId} />
      </CustomTabPanel>
    </>
  )
}

export default GroupInfoWindow
