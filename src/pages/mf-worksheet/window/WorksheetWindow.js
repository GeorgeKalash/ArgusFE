import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import WorksheetForm from '../forms/WorksheetForm.js'

const WorksheetWindow = ({ recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)
  const editMode = !!recordId

  const [store, setStore] = useState({
    recordId: recordId || null
  })

  const tabs = [{ label: labels.Worksheet }, { label: labels.Materials, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <WorksheetForm labels={labels} setStore={setStore} store={store} editMode={editMode} maxAccess={maxAccess} />
      </CustomTabPanel>
      {/* <CustomTabPanel index={1} value={activeTab}>
        <BarcodeForm labels={labels} setStore={setStore} store={store} />
      </CustomTabPanel> */}
    </>
  )
}

export default WorksheetWindow
