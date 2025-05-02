import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import DesignsForm from '../Forms/DesignsForm.js'
import DesignRoutingSequence from '../Forms/DesignRoutingSequence.js'
import Components from '../Forms/Components.js'

const MFDesignsWindow = ({ recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId
  })

  const tabs = [
    { label: labels.Design },
    { label: labels.DesignRoutingSequence, disabled: !store.recordId },
    { label: labels.Components, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel height={670} index={0} value={activeTab}>
        <DesignsForm labels={labels} setStore={setStore} store={store} access={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <DesignRoutingSequence labels={labels} setStore={setStore} store={store} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <Components labels={labels} maxAccess={maxAccess} setStore={setStore} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default MFDesignsWindow
