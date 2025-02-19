import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import JobOrderForm from '../form/JobOrderForm'
import RoutingTab from '../form/RoutingTab'
import WorksheetTab from '../form/WorksheetTab'
import OverheadTab from '../form/OverheadTab'
import MaterialsTab from '../form/MaterialsTab'
import SizesTab from '../form/SizesTab'

const JobOrderWindow = ({ recordId, access, labels }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [store, setStore] = useState({ recordId, isPosted: false, isCancelled: false })
  const [refetchRouting, setRefetchRouting] = useState(false)

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
        <JobOrderForm
          store={store}
          setStore={setStore}
          labels={labels}
          maxAccess={access}
          setRefetchRouting={setRefetchRouting}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <RoutingTab
          store={store}
          labels={labels}
          maxAccess={access}
          refetchRouting={refetchRouting}
          setRefetchRouting={setRefetchRouting}
        />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <WorksheetTab store={store} labels={labels} maxAccess={access} />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab}>
        <OverheadTab store={store} labels={labels} maxAccess={access} />
      </CustomTabPanel>
      <CustomTabPanel index={4} value={activeTab}>
        <MaterialsTab store={store} labels={labels} maxAccess={access} />
      </CustomTabPanel>
      <CustomTabPanel index={5} value={activeTab}>
        <SizesTab store={store} labels={labels} maxAccess={access} />
      </CustomTabPanel>
    </>
  )
}

export default JobOrderWindow
