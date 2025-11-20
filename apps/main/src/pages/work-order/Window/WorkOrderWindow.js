import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import WorkOrderForm from '../forms/WorkOrderForm'
import TaskList from '../forms/TaskList'

const WorkOrderWindow = ({ recordId, labels, access, window }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null,
    equipmentId: null,
    reference: null,
    isPosted: false
  })

  const tabs = [{ label: labels.workOrder }, { label: labels.task, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={access} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={access}>
        <WorkOrderForm labels={labels} setStore={setStore} store={store} access={access} window={window} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={access}>
        <TaskList labels={labels} access={access} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default WorkOrderWindow
