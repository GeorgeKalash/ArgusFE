import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import UsersTab from '../Tabs/UsersTab'
import DefaultsTab from '../Tabs/DefaultsTab'
import SecurityGrpTab from '../Tabs/SecurityGrpTab'
import RowAccessTab from '../Tabs/RowAccessTab'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import DocTypeTab from '../Tabs/DocTypeTab'
import ReleaseCodeTab from '../Tabs/ReleaseCodeTab'
import SitesTab from '../Tabs/SitesTab'

const UsersWindow = ({ labels, maxAccess, recordId }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [storeRecordId, setRecordId] = useState(recordId)

  const tabs = [
    { label: labels.users },
    { label: labels.defaults, disabled: !storeRecordId },
    { label: labels.securityGroups, disabled: !storeRecordId },
    { label: labels.docType, disabled: !storeRecordId },
    { label: labels.site, disabled: !storeRecordId },
    { label: labels.rowAccess, disabled: !storeRecordId },
    { label: labels.releaseCode, disabled: !storeRecordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <UsersTab labels={labels} maxAccess={maxAccess} storeRecordId={storeRecordId} setRecordId={setRecordId} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <DefaultsTab labels={labels} maxAccess={maxAccess} storeRecordId={storeRecordId}></DefaultsTab>
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab} maxAccess={maxAccess}>
        <SecurityGrpTab labels={labels} maxAccess={maxAccess} storeRecordId={storeRecordId} />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab} maxAccess={maxAccess}>
        <DocTypeTab labels={labels} maxAccess={maxAccess} storeRecordId={storeRecordId} />
      </CustomTabPanel>
      <CustomTabPanel index={4} value={activeTab} maxAccess={maxAccess}>
        <SitesTab labels={labels} maxAccess={maxAccess} recordId={storeRecordId} />
      </CustomTabPanel>
      <CustomTabPanel index={5} value={activeTab} maxAccess={maxAccess}>
        <RowAccessTab labels={labels} maxAccess={maxAccess} storeRecordId={storeRecordId} />
      </CustomTabPanel>
      <CustomTabPanel index={6} value={activeTab} maxAccess={maxAccess}>
        <ReleaseCodeTab labels={labels} maxAccess={maxAccess} storeRecordId={storeRecordId} />
      </CustomTabPanel>
    </>
  )
}

export default UsersWindow
