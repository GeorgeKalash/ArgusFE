import CbBanksForm from '../forms/CbBanksForm'
import { useState } from 'react'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { InterfacesForm } from '@argus/shared-ui/src/components/Shared/InterfacesForm'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

const CbBanksWindow = ({ labels, maxAccess, recordId }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId,
    name: null
  })

  const tabs = [{ label: labels?.bank }, { label: labels?.interface, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <CbBanksForm labels={labels} maxAccess={maxAccess} store={store} setStore={setStore} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
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
