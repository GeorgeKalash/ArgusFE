import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import MainForm from '../Forms/MainForm'
import JobMaterialsForm from '../Forms/JobMaterialsForm'

const BatchWorksheetWindow = ({ recordId, labels, access, window }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId
  })

  const tabs = [{ label: labels.main }, { label: labels.jobMaterials, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <MainForm labels={labels} setStore={setStore} store={store} access={access} window={window} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <JobMaterialsForm labels={labels} access={access} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default BatchWorksheetWindow
