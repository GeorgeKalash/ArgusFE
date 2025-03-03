import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import WorksheetForm from '../forms/WorksheetForm.js'
import MaterialsTab from '../forms/MaterialsTab.js'

const WorksheetWindow = ({ recordId, labels, maxAccess, window }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId,
    isPosted: false,
    values: null
  })

  const tabs = [{ label: labels.Worksheet }, { label: labels.Materials, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <WorksheetForm labels={labels} setStore={setStore} store={store} maxAccess={maxAccess} window={window} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <MaterialsTab labels={labels} access={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default WorksheetWindow
