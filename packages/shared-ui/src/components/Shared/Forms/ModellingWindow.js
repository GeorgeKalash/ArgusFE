import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import ModellingForm from '@argus/shared-ui/src/components/Shared/Forms/ModellingForm'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow'
import ModellingMaterialsForm from '@argus/shared-ui/src/components/Shared/Forms/ModellingMaterialsForm'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'

export default function ModellingWindow({ recordId, window }) {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId,
    isClosed: false
  })

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.ModelMaker,
    editMode: !!recordId
  })
    
  useSetWindow({ title: labels.modelMaker, window })

  const tabs = [{ label: labels.modelling }, { label: labels.materials, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={access} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={access}>
        <ModellingForm labels={labels} access={access} setStore={setStore} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={access}>
        <ModellingMaterialsForm access={access} labels={labels} store={store} />
      </CustomTabPanel>
    </>
  )
}

ModellingWindow.width = 900
ModellingWindow.height = 680