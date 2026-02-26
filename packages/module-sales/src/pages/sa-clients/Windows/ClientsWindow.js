import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import ClientsForm from '../forms/ClientsForm'
import SalesForm from '../forms/SalesForm'
import ClientsAddressTab from '../forms/ClientsAddressTab'
import PriceTab from '../forms/PriceTable'

const ClientsWindow = ({ height, recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null,
    record: null
  })

  const tabs = [
    { label: labels.clients },
    { label: labels.sales, disabled: !store.recordId },
    { label: labels.address, disabled: !store.recordId },
    { label: labels.price, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel height={height} index={0} value={activeTab} maxAccess={maxAccess}>
        <ClientsForm store={store} setStore={setStore} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab} maxAccess={maxAccess}>
        <SalesForm store={store} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={2} value={activeTab} maxAccess={maxAccess}>
        <ClientsAddressTab store={store} setStore={setStore} />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={3} value={activeTab} maxAccess={maxAccess}>
        <PriceTab store={store} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
    </>
  )
}

export default ClientsWindow
