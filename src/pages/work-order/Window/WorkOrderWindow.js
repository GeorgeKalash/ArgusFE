import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import WorkOrderForm from '../forms/WorkOrderForm'
import TaskList from '../forms/TaskList'

const WorkOrderWindow = ({ recordId, labels, access }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null
  })

  const tabs = [{ label: labels.metals }, { label: labels.scrap, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <WorkOrderForm labels={labels} setStore={setStore} store={store} access={access} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <TaskList labels={labels} access={access} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default WorkOrderWindow
