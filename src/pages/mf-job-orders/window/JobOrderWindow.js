import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import JobOrderForm from '../form/JobOrderForm'

const JobOrderWindow = ({ recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null,
    record: null
  })

  const tabs = [
    { label: labels.jobOrder },
    { label: labels.routing, disabled: !store.recordId },
    { label: labels.worksheet, disabled: !store.recordId },
    { label: labels.overhead, disabled: !store.recordId },
    { label: labels.materials, disabled: !store.recordId },
    { label: labels.size, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <JobOrderForm store={store} setStore={setStore} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <JobOrderForm store={store} setStore={setStore} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <JobOrderForm store={store} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab}>
        <JobOrderForm store={store} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
    </>
  )
}

export default JobOrderWindow
