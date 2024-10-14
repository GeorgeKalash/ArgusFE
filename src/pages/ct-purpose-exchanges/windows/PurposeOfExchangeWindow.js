import PurposeOfExchangeForm from '../forms/PurposeOfExchangeForm'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { InterfacesForm } from 'src/components/Shared/InterfacesForm'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'

const PurposeOfExchangeWindow = ({ labels, maxAccess, recordId }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null,
    name: null
  })

  const tabs = [{ label: labels?.main }, { label: labels?.interface, disabled: !store.recordId }]

  return (
    <VertLayout>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <PurposeOfExchangeForm labels={labels} maxAccess={maxAccess} recordId={recordId} setStore={setStore} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
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
