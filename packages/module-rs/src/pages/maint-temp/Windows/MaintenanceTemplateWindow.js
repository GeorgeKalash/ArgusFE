import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import InfoTab from '../Forms/InfoTab'
import TasksTab from '../Forms/TasksTab'
import { useState } from 'react'

export default function MaintenanceTemplateWindow({ labels, recordId, maxAccess }) {
  const [activeTab, setActiveTab] = useState(0)
  const [store, setStore] = useState({ recordId })

  const tabs = [{ label: labels.info }, { label: labels.tasks, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <InfoTab store={store} setStore={setStore} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <TasksTab store={store} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
    </>
  )
}
