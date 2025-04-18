import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import AssemblyForm from '../forms/AssemblyForm'
import OverheadForm from '../forms/OverheadForm'

const AssemblyWindow = ({ recordId, access, labels }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [store, setStore] = useState({ recordId, isPosted: false })
  const tabs = [{ label: labels.assembly }, { label: labels.overhead, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <AssemblyForm store={store} setStore={setStore} labels={labels} maxAccess={access} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <OverheadForm store={store} labels={labels} maxAccess={access} />
      </CustomTabPanel>
    </>
  )
}

export default AssemblyWindow
