// ** Custom Imports
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'
import HrPenTypeForm from '../forms/HrPenTypeForm'
import HrPenDetailForm from '../forms/HrPenDetailForm'

const HrPenTypeWindow = ({ recordId, labels, access, window }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId
  })

  const editMode = !!store.recordId

  const tabs = [{ label: labels.penaltyType }, { label: labels.penaltyDetail, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <CustomTabPanel index={0} value={activeTab}>
        <HrPenTypeForm
          labels={labels}
          setStore={setStore}
          store={store}
          editMode={editMode}
          maxAccess={access}
          window={window}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <HrPenDetailForm labels={labels} maxAccess={access} store={store} editMode={editMode} />
      </CustomTabPanel>
    </>
  )
}

export default HrPenTypeWindow
