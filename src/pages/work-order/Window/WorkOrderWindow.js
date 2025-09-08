import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import WorkOrderForm from '../forms/WorkOrderForm'

const WorkOrderWindow = ({ recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null
  })

  const tabs = [{ label: labels.metals }, { label: labels.scrap, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <WorkOrderForm labels={labels} setStore={setStore} store={store} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        {/* <ScrapForm labels={labels} maxAccess={maxAccess} store={store} /> */}
      </CustomTabPanel>
    </>
  )
}

export default WorkOrderWindow
