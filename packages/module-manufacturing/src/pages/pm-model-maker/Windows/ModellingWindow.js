import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import ModellingForm from '../Tabs/ModellingForm'
import MaterialsForm from '../Tabs/MaterialsForm'

export default function ModellingWindow({ labels, access, recordId }) {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId,
    isClosed: false
  })

  const tabs = [{ label: labels.modelling }, { label: labels.materials, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={access} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={access}>
        <ModellingForm labels={labels} access={access} setStore={setStore} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={access}>
        <MaterialsForm access={access} labels={labels} store={store} />
      </CustomTabPanel>
    </>
  )
}
