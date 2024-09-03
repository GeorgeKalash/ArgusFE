import CbBanksForm from '../forms/CbBanksForm'
import { useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { InterfacesForm } from 'src/components/Shared/InterfacesForm'
import { ResourceIds } from 'src/resources/ResourceIds'

const CbBanksWindow = ({ labels, maxAccess, recordId }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId,
    name: null
  })

  const tabs = [{ label: labels?.bank }, { label: labels?.interface, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <CbBanksForm labels={labels} maxAccess={maxAccess} store={store} setStore={setStore} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <InterfacesForm
          labels={labels}
          resourceId={ResourceIds.CbBanks}
          recordId={store.recordId}
          maxAccess={maxAccess}
          name={store.name}
        />
      </CustomTabPanel>
    </>
  )
}

export default CbBanksWindow
