import { useState } from 'react'
import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import ExchangeTablesForm from '../forms/ExchangeTablesForm'
import ExchangeRatesGridForm from '../forms/ExchangeRatesGridForm'

export default function ExchangeTablesWindow({ labels, maxAccess, recordId, invalidate }) {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId
  })

  const tabs = [
    { label: labels.ExchangeTables },
    { label: labels.exRate, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />

      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <ExchangeTablesForm
          labels={labels}
          maxAccess={maxAccess}
          store={store}
          setStore={setStore}
          invalidate={invalidate}
        />
      </CustomTabPanel>

      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <ExchangeRatesGridForm labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}