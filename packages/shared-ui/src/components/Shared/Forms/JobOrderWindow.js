import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import JobOrderForm from './JobOrderForm'
import RoutingTab from './RoutingTab'
import WorksheetTab from './WorksheetTab'
import OverheadTab from './OverheadTab'
import MaterialsTab from './MaterialsTab'
import SizesTab from './SizesTab'
import WorkCenterTab from './WorkCenterTab'
import ItemTab from './ItemTab'

const JobOrderWindow = ({ recordId, jobReference, invalidate, lockRecord, window }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [store, setStore] = useState({ recordId, jobReference, isPosted: false, isCancelled: false })
  const [refetchRouting, setRefetchRouting] = useState(false)
  const [refetchJob, setRefetchJob] = useState(false)

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.MFJobOrders,
    editMode: !!recordId
  })

  useSetWindow({ title: labels.jobOrder, window })

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
        <WorksheetTab store={store} labels={labels} maxAccess={access} setRefetchJob={setRefetchJob}/>
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

JobOrderWindow.width = 1150
JobOrderWindow.height = 720

export default JobOrderWindow
