import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import SerialProfilesForm from '../Forms/SerialProfilesForm'
import SerialProfileSequences from '../Forms/SerialProfileSequences'

export default function SerialProfileWindow({ labels, maxAccess, recordId }) {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null
  })

  const tabs = [
    { label: labels.SerialNumbersProfiles },
    { label: labels.SerialProfileSequences, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <SerialProfilesForm labels={labels} maxAccess={maxAccess} setStore={setStore} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <SerialProfileSequences labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}
