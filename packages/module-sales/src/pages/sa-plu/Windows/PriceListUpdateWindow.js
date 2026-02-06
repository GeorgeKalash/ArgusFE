import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import PriceListUpdateForm from '../Forms/PriceListUpdateForm'
import ItemsList from '../Forms/ItemsList'

export default function PriceListUpdateWindow({ labels, maxAccess, recordId }) {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId,
    items: []
  })

  const tabs = [{ label: labels.PriceListUpdate }, { label: labels.items, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <PriceListUpdateForm labels={labels} maxAccess={maxAccess} setStore={setStore} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <ItemsList labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}
