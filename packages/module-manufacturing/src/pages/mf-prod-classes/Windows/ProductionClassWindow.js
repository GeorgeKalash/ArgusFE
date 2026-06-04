import { useState } from 'react'
import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import ProductionClassForm from '../forms/ProductionClassForm'
import SFItemForm from '../forms/SFItemForm'

export default function ProductionClassWindow({ labels, maxAccess, recordId }) {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId
  })

  const tabs = [
    { label: labels.class },
    { label: labels.semiFinishedItem, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />

      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <ProductionClassForm labels={labels} maxAccess={maxAccess} store={store} setStore={setStore} />
      </CustomTabPanel>

      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <SFItemForm labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}