import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import GroupInfoTab from '../Tabs/GroupInfoTab'
import SGUsersTab from '../Tabs/SGUsersTab'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
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
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel height={height} index={0} value={activeTab} maxAccess={maxAccess}>
        <GroupInfoTab labels={labels} maxAccess={maxAccess} storeRecordId={storeRecordId} setRecordId={setRecordId} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <SGUsersTab maxAccess={maxAccess} labels={labels} storeRecordId={storeRecordId} />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab} maxAccess={maxAccess}>
        <SGAccessLevelTab maxAccess={maxAccess} labels={labels} storeRecordId={storeRecordId} />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab} maxAccess={maxAccess}>
        <RowAccessTab maxAccess={maxAccess} labels={labels} recordId={storeRecordId} />
      </CustomTabPanel>
      <CustomTabPanel index={4} value={activeTab} maxAccess={maxAccess}>
        <ReleaseCodeTab maxAccess={maxAccess} labels={labels} recordId={storeRecordId} />
      </CustomTabPanel>
    </>
  )
}

export default GroupInfoWindow
