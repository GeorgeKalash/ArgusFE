import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import CastingForm from '../form/CastingForm'
import DisassemblyForm from '../form/DisassemblyForm'
import JobsForm from '../form/JobsForm'

const FOCastingWindow = ({ recordId, access, labels }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [store, setStore] = useState({ recordId, isPosted: false, isCancelled: false, metalInfo: {}, scrapWgt: 0 })
  const [recalculateJobs, setRecalculateJobs] = useState(false)

  const tabs = [
    { label: labels.castings },
    { label: labels.disassembly, disabled: !store.recordId },
    { label: labels.jobs, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <CastingForm
          store={store}
          setStore={setStore}
          labels={labels}
          maxAccess={access}
          setRecalculateJobs={setRecalculateJobs}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <DisassemblyForm
          store={store}
          setStore={setStore}
          labels={labels}
          maxAccess={access}
          setRecalculateJobs={setRecalculateJobs}
        />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <JobsForm
          store={store}
          labels={labels}
          maxAccess={access}
          setRecalculateJobs={setRecalculateJobs}
          recalculateJobs={recalculateJobs}
        />
      </CustomTabPanel>
    </>
  )
}

export default FOCastingWindow
