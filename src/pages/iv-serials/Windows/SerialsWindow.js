import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import SerialsForm from '../Forms/SerialsForm'
import AvailabilityForm from '../Forms/AvailabilityForm'

const SerialsWindow = ({ labels, maxAccess, recordId }) => {
  const [store, setStore] = useState({
    recordId: recordId
  })

  const [activeTab, setActiveTab] = useState(0)
  const tabs = [{ label: labels.Serials }, { label: labels.Availability, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <SerialsForm labels={labels} maxAccess={maxAccess} store={store} setStore={setStore} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <AvailabilityForm labels={labels} maxAccess={maxAccess} recordId={store?.recordId} />
      </CustomTabPanel>
    </>
  )
}

export default SerialsWindow
