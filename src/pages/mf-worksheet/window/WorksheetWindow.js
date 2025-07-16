import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import WorksheetForm from '../forms/WorksheetForm.js'
import MaterialsTab from '../forms/MaterialsTab.js'
import OperationsTab from '../forms/OperationsTab.js'
import useSetWindow from 'src/hooks/useSetWindow.js'
import { ResourceIds } from 'src/resources/ResourceIds.js'
import useResourceParams from 'src/hooks/useResourceParams.js'

const WorksheetWindow = ({ recordId, window }) => {
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
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <WorksheetForm labels={labels} setStore={setStore} store={store} maxAccess={access} window={window} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <MaterialsTab store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <OperationsTab store={store} />
      </CustomTabPanel>
    </>
  )
}

WorksheetWindow.width = 1200
WorksheetWindow.height = 650

export default WorksheetWindow
