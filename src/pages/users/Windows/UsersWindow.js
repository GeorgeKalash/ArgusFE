import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import UsersTab from 'src/pages/users/Tabs/UsersTab'
import DefaultsTab from 'src/pages/users/Tabs/DefaultsTab'
import SecurityGrpTab from 'src/pages/users/Tabs/SecurityGrpTab'
import RowAccessTab from 'src/pages/users/Tabs/RowAccessTab'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
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
      <CustomTabPanel index={3} value={activeTab}>
        <DocTypeTab labels={labels} maxAccess={maxAccess} storeRecordId={storeRecordId} />
      </CustomTabPanel>
      <CustomTabPanel index={4} value={activeTab}>
        <SitesTab labels={labels} maxAccess={maxAccess} recordId={storeRecordId} />
      </CustomTabPanel>
      <CustomTabPanel index={5} value={activeTab}>
        <RowAccessTab labels={labels} maxAccess={maxAccess} storeRecordId={storeRecordId} />
      </CustomTabPanel>
      <CustomTabPanel index={6} value={activeTab}>
        <ReleaseCodeTab labels={labels} maxAccess={maxAccess} storeRecordId={storeRecordId} />
      </CustomTabPanel>
    </>
  )
}

export default UsersWindow
