import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import VendorsForm from '../form/VendorsForm'
import VendorsAddressGrid from '../form/VendorsAddressGrid'

const VendorsWindow = ({ labels, maxAccess, recordId }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null,
    name: null
  })

  const tabs = [{ label: labels?.vendor }, { label: labels?.address, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <VendorsForm labels={labels} maxAccess={maxAccess} recordId={recordId} setStore={setStore} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <VendorsAddressGrid
          labels={labels}
          recordId={store.recordId}
          maxAccess={maxAccess}
          store={store}
          setStore={setStore}
        />
      </CustomTabPanel>
    </>
  )
}

export default VendorsWindow
