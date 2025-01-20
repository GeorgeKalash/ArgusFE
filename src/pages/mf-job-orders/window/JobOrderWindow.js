import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import JobOrderForm from '../form/JobOrderForm'
import RoutingTab from '../form/RoutingTab'
import WorksheetTab from '../form/WorksheetTab'

const JobOrderWindow = ({ recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [store, setStore] = useState(recordId)

  const tabs = [
    { label: labels.jobOrder },
    { label: labels.routing, disabled: !store },
    { label: labels.worksheet, disabled: !store },
    { label: labels.overhead, disabled: !store },
    { label: labels.materials, disabled: !store },
    { label: labels.size, disabled: !store }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <JobOrderForm recordId={store} setStore={setStore} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <RoutingTab recordId={store} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <WorksheetTab recordId={store} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab}>
        <JobOrderForm recordId={store} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
    </>
  )
}

export default JobOrderWindow
