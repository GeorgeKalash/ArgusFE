import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import MetalSettingsForm from '../Forms/MetalSettingsForm.js'
import ScrapForm from '../Forms/Scrap.js'

const MetalSettingsWindow = ({ recordId, metalColorId, labels, maxAccess, window }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null,
    metalColorId: metalColorId || null,
    scrap: []
  })

  const tabs = [{ label: labels.MetalSettings }, { label: labels.Scrap, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <MetalSettingsForm labels={labels} setStore={setStore} store={store} access={maxAccess} window={window} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <ScrapForm labels={labels} store={store} maxAccess={maxAccess} />
      </CustomTabPanel>
    </>
  )
}

export default MetalSettingsWindow
