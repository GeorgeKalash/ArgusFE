import { InterfacesForm } from '@argus/shared-ui/src/components/Shared/InterfacesForm'
import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import CountryForm from '../forms/CountryForm'

const CountryWindow = ({ labels, maxAccess, recordId }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null,
    name: null
  })

  const tabs = [{ label: labels?.country }, { label: labels?.interface, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <CountryForm labels={labels} maxAccess={maxAccess} recordId={recordId} setStore={setStore} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <InterfacesForm
          labels={labels}
          resourceId={ResourceIds.Countries}
          recordId={store.recordId}
          maxAccess={maxAccess}
          name={store.name}
        />
      </CustomTabPanel>
    </>
  )
}

export default CountryWindow
