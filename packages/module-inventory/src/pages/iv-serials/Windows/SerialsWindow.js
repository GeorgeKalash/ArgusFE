import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import SerialsForm from '../Forms/SerialsForm'
import AvailabilityForm from '../Forms/AvailabilityForm'

const SerialsWindow = ({ labels, maxAccess, recordId }) => {
  const [store, setStore] = useState({
    recordId
  })

  const [activeTab, setActiveTab] = useState(0)
  const tabs = [{ label: labels.Serials }, { label: labels.Availability, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <SerialsForm labels={labels} maxAccess={maxAccess} store={store} setStore={setStore} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <AvailabilityForm labels={labels} maxAccess={maxAccess} recordId={store?.recordId} />
      </CustomTabPanel>
    </>
  )
}

export default SerialsWindow
