import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import DisassemblyForm from '@argus/shared-ui/src/components/Shared/Forms/DisassemblyForm'
import JobsForm from '@argus/shared-ui/src/components/Shared/Forms/JobsForm'
import CuttingForm from '../Form/CuttingForm'

export default function FOCuttingWindow({ labels, access, recordId }) {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null,
  })

  const tabs = [
    { label: labels.cutting },
    { label: labels.disassembly, disabled: !store.recordId || !store.castingId },
    { label: labels.jobs, disabled: !store.recordId || !store.castingId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={access} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={access}>
        <CuttingForm labels={labels} access={access} setStore={setStore} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={access}>
        <DisassemblyForm store={store} setStore={setStore} castingId={store?.castingId} />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab} maxAccess={access}>
        <JobsForm store={store} castingId={store?.castingId} />
      </CustomTabPanel>
    </>
  )
}