import Window from 'src/components/Shared/Window'
import PurposeOfExchangeForm from '../forms/PurposeOfExchangeForm'
import InterfaceForm from 'src/pages/interface/forms/InterfaceForm'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { InterfacesForm } from 'src/components/Shared/InterfacesForm'
import { ResourceIds } from 'src/resources/ResourceIds'

const PurposeOfExchangeWindow = ({ labels, maxAccess, recordId, height }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null,
    name: null
  })

  const tabs = [{ label: labels?.main }, { label: labels?.interface, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel height={height} index={0} value={activeTab}>
        <PurposeOfExchangeForm labels={labels} maxAccess={maxAccess} recordId={recordId} setStore={setStore} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <InterfacesForm
          height={height}
          labels={labels}
          resourceId={ResourceIds.PurposeOfExchange}
          recordId={store.recordId}
          maxAccess={maxAccess}
          name={store.name}
        />
      </CustomTabPanel>
    </>
  )
}

export default PurposeOfExchangeWindow
