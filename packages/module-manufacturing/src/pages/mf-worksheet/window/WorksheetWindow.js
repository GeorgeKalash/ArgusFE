import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import WorksheetForm from '../forms/WorksheetForm.js'
import MaterialsTab from '../forms/MaterialsTab.js'
import OperationsTab from '../forms/OperationsTab.js'
import useSetWindow from '@argus/shared-hooks/src/hooks/useSetWindow.js'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams.js'

const WorksheetWindow = ({ recordId, window, joInvalidate }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId,
    isPosted: false,
    values: null
  })

  const { labels, access } = useResourceParams({
    datasetId: ResourceIds.Worksheet,
    editMode: !!recordId
  })

  useSetWindow({ title: labels.Worksheet, window })

  const tabs = [
    { label: labels.Worksheet },
    { label: labels.issueOfMaterials, disabled: !store.recordId },
    { label: labels.Summary, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={access} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={access}>
        <WorksheetForm
          labels={labels}
          setStore={setStore}
          store={store}
          maxAccess={access}
          window={window}
          joInvalidate={joInvalidate}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={access}>
        <MaterialsTab store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab} maxAccess={access}>
        <OperationsTab store={store} labels={labels} maxAccess={access} />
      </CustomTabPanel>
    </>
  )
}

WorksheetWindow.width = 1200
WorksheetWindow.height = 650

export default WorksheetWindow
