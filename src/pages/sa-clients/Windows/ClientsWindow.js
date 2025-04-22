import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import ClientsForm from '../forms/ClientsForm'
import SalesForm from '../forms/SalesForm'
import AddressTab from '../forms/AddressTab'
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
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel height={height} index={0} value={activeTab}>
        <ClientsForm store={store} setStore={setStore} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab}>
        <SalesForm store={store} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={2} value={activeTab}>
        <AddressTab store={store} setStore={setStore} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={3} value={activeTab}>
        <PriceTab store={store} labels={labels} maxAccess={maxAccess} />
      </CustomTabPanel>
    </>
  )
}

export default ClientsWindow
