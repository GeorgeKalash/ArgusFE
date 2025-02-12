import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import MetalSettingsForm from '../Forms/MetalSettingsForm.js'
import ScrapForm from '../Forms/Scrap.js'

const MetalSettingsWindow = ({ obj, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)
  const editMode = !!obj?.metalId

  const [store, setStore] = useState({
    recordId: obj?.metalId || null,
    metalColorId: obj?.metalColorId || null,
    scrap: []
  })

  const tabs = [
    { label: labels.MetalSettings },
    { label: labels.Scrap, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <MetalSettingsForm labels={labels} setStore={setStore} store={store} access={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <ScrapForm labels={labels} setStore={setStore} editMode={editMode} store={store} maxAccess={maxAccess} />
      </CustomTabPanel>
    </>
  )
}

export default MetalSettingsWindow
