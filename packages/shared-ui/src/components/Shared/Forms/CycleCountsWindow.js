import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import CycleCountsForm from '@argus/shared-ui/src/components/Shared/Forms/CycleCountsForm'
import Sites from '@argus/shared-ui/src/components/Shared/Forms/Sites'
import Controller from '@argus/shared-ui/src/components/Shared/Forms/Controller'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'

const CycleCountsWindow = ({ recordId, plantId, window }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null,
    isPosted: false,
    isClosed: false
  })

  const { labels, access: maxAccess } = useResourceParams({
    datasetId: ResourceIds.StockCounts,
    editMode: !!recordId
  })
  
  useSetWindow({ title: labels.cycleCounts, window })

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

CycleCountsWindow.width = 650
CycleCountsWindow.height = 750

export default CycleCountsWindow
