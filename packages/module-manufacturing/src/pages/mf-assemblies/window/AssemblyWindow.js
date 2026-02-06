import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import AssemblyForm from '../forms/AssemblyForm'
import OverheadForm from '../forms/OverheadForm'

const AssemblyWindow = ({ recordId, access, labels }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [store, setStore] = useState({ recordId, isPosted: false })
  const [totalOverhead, setTotalOverhead] = useState(0)
  const tabs = [{ label: labels.assembly }, { label: labels.overhead, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={access} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={access}>
        <AssemblyForm
          store={store}
          setStore={setStore}
          labels={labels}
          maxAccess={access}
          totalOverhead={totalOverhead}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={access}>
        <OverheadForm store={store} labels={labels} maxAccess={access} setTotalOverhead={setTotalOverhead} />
      </CustomTabPanel>
    </>
  )
}

export default AssemblyWindow
