import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import CycleCountsForm from '../Forms/CycleCountsForm'
import Sites from '../Forms/Sites'
import Controller from '../Forms/Controller'

const CycleCountsWindow = ({ recordId, labels, maxAccess, plantId }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null,
    isPosted: false,
    isClosed: false
  })

  const [refreshController, setRefreshController] = useState(false)
  const editMode = !!store.recordId

  const tabs = [
    { label: labels.cycleCounts },
    { label: labels.sites, disabled: !editMode },
    { label: labels.controller, disabled: !editMode }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />

      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <CycleCountsForm labels={labels} setStore={setStore} store={store} maxAccess={maxAccess} plantId={plantId} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <Sites
          labels={labels}
          maxAccess={maxAccess}
          store={store}
          setRefreshController={setRefreshController}
          refreshController={refreshController}
        />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab} maxAccess={maxAccess}>
        <Controller labels={labels} maxAccess={maxAccess} store={store} key={refreshController} />
      </CustomTabPanel>
    </>
  )
}

export default CycleCountsWindow
