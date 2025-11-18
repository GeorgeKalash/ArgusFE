import PurposeOfExchangeForm from '../forms/PurposeOfExchangeForm'
import CustomTabPanel from '@argus/shared-ui/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from '@argus/shared-ui/components/Shared/CustomTabs'
import { InterfacesForm } from '@argus/shared-ui/components/Shared/InterfacesForm'
import { ResourceIds } from '@argus/shared-domain/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/components/Layouts/VertLayout'

const PurposeOfExchangeWindow = ({ labels, maxAccess, recordId }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null,
    name: null
  })

  const tabs = [{ label: labels?.main }, { label: labels?.interface, disabled: !store.recordId }]

  return (
    <VertLayout>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <PurposeOfExchangeForm labels={labels} maxAccess={maxAccess} recordId={recordId} setStore={setStore} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <InterfacesForm
          labels={labels}
          resourceId={ResourceIds.PurposeOfExchange}
          recordId={store.recordId}
          maxAccess={maxAccess}
          name={store.name}
        />
      </CustomTabPanel>
    </VertLayout>
  )
}

export default PurposeOfExchangeWindow
