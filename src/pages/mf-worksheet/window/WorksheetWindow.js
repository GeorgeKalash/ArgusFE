import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import WorksheetForm from '../forms/WorksheetForm.js'
import MaterialsTab from '../forms/MaterialsTab.js'

const WorksheetWindow = ({ recordId, labels, maxAccess, invalidate, seqNo }) => {
  const [activeTab, setActiveTab] = useState(0)
  const editMode = !!recordId

  const [store, setStore] = useState({
    recordId: recordId || null,
    isPosted: false,
    seqNo: seqNo
  })

  const tabs = [{ label: labels.Worksheet }, { label: labels.Materials, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <WorksheetForm
          labels={labels}
          setStore={setStore}
          store={store}
          editMode={editMode}
          maxAccess={maxAccess}
          invalidate={invalidate}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <MaterialsTab labels={labels} access={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default WorksheetWindow
