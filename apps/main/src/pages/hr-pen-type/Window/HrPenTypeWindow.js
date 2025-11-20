import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import HrPenTypeForm from '../forms/HrPenTypeForm'
import HrPenDetailForm from '../forms/HrPenDetailForm'

const HrPenTypeWindow = ({ recordId, labels, access }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId
  })

  const tabs = [{ label: labels.penaltyType }, { label: labels.penaltyDetail, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={access} />

      <CustomTabPanel index={0} value={activeTab} maxAccess={access}>
        <HrPenTypeForm labels={labels} setStore={setStore} store={store} maxAccess={access} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={access}>
        <HrPenDetailForm labels={labels} maxAccess={access} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default HrPenTypeWindow
