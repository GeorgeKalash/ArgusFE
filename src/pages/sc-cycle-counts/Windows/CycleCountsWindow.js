import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useCallback, useState } from 'react'
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

  const [refreshController, setRefreshController] = useState(false);
  const editMode = !!store.recordId

  const tabs = [{ label: labels.cycleCounts }, { label: labels.sites, disabled: !editMode }, { label: labels.controller, disabled: !editMode }]

  const handleSitesSave = useCallback(() => {
    setRefreshController(prev => !prev); 
  }, []);

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <CustomTabPanel index={0} value={activeTab}>
        <CycleCountsForm labels={labels} setStore={setStore} store={store} maxAccess={maxAccess} plantId={plantId}/>
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <Sites labels={labels} maxAccess={maxAccess} store={store} onSave={handleSitesSave}/>
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <Controller labels={labels} maxAccess={maxAccess} store={store} refreshController={refreshController} />
      </CustomTabPanel>
    </>
  )
}

export default CycleCountsWindow
