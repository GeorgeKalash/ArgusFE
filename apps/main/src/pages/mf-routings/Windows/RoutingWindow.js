import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import RoutingForm from '../forms/RoutingForm'
import RoutingSeqForm from '../forms/RoutingSeqForm'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'

const RoutingWindow = ({ labels, maxAccess, recordId }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId
  })
  const tabs = [{ label: labels.routing }, { label: labels.routingSeq, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <RoutingForm labels={labels} maxAccess={maxAccess} setStore={setStore} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <RoutingSeqForm maxAccess={maxAccess} labels={labels} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default RoutingWindow
