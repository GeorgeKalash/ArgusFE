import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import JobOrderForm from '../form/JobOrderForm'
import RoutingTab from '../form/RoutingTab'
import WorksheetTab from '../form/WorksheetTab'
import OverheadTab from '../form/OverheadTab'
import MaterialsTab from '../form/MaterialsTab'
import SizesTab from '../form/SizesTab'
import WorkCenterTab from '../form/WorkCenterTab'
import ItemTab from '../form/ItemTab'

const JobOrderWindow = ({ recordId, jobReference, access, labels, invalidate, lockRecord, window }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [store, setStore] = useState({ recordId, jobReference, isPosted: false, isCancelled: false })
  const [refetchRouting, setRefetchRouting] = useState(false)
  const [refetchJob, setRefetchJob] = useState(false)

  const tabs = [
    { label: labels.jobOrder },
    {
      label: labels.routing,
      disabled: !store.recordId,
      onRefetch: () => {
        setRefetchRouting(true)
      }
    },
    { label: labels.worksheet, disabled: !store.recordId },
    { label: labels.overhead, disabled: !store.recordId },
    { label: labels.materials, disabled: !store.recordId },
    { label: labels.size, disabled: !store.recordId },
    { label: labels.workCenter, disabled: !store.recordId },
    { label: labels.item, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={access} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={access}>
        <JobOrderForm
          store={store}
          setStore={setStore}
          labels={labels}
          maxAccess={access}
          setRefetchRouting={setRefetchRouting}
          invalidate={invalidate}
          lockRecord={lockRecord}
          refetchJob={refetchJob}
          setRefetchJob={setRefetchJob}
          window={window}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={access}>
        <RoutingTab
          store={store}
          labels={labels}
          maxAccess={access}
          refetchRouting={refetchRouting}
          setRefetchRouting={setRefetchRouting}
          setRefetchJob={setRefetchJob}
        />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab} maxAccess={access}>
        <WorksheetTab store={store} labels={labels} maxAccess={access} />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab} maxAccess={access}>
        <OverheadTab store={store} labels={labels} maxAccess={access} />
      </CustomTabPanel>
      <CustomTabPanel index={4} value={activeTab} maxAccess={access}>
        <MaterialsTab store={store} labels={labels} maxAccess={access} />
      </CustomTabPanel>
      <CustomTabPanel index={5} value={activeTab} maxAccess={access}>
        <SizesTab store={store} labels={labels} maxAccess={access} />
      </CustomTabPanel>
      <CustomTabPanel index={6} value={activeTab} maxAccess={access}>
        <WorkCenterTab store={store} labels={labels} maxAccess={access} />
      </CustomTabPanel>
      <CustomTabPanel index={7} value={activeTab} maxAccess={access}>
        <ItemTab store={store} labels={labels} maxAccess={access} />
      </CustomTabPanel>
    </>
  )
}

export default JobOrderWindow
