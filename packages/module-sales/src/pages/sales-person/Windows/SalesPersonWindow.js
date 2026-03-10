import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import GeneralForm from '../Forms/GeneralForm'
import { useState } from 'react'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import TargetForm from '../Forms/TargetForm'
import MonthlyTargetForm from '../Forms/MonthlyTargetForm'

const SalesPersonWindow = ({ labels, maxAccess, recordId }) => {
  const [store, setStore] = useState({
    recordId
  })

  const [activeTab, setActiveTab] = useState(0)

  const tabs = [
    { label: labels.general },
    { label: labels.target, disabled: !store.recordId },
    { label: labels.monthlyTarget, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <GeneralForm labels={labels} maxAccess={maxAccess} store={store} setStore={setStore} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <TargetForm labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab} maxAccess={maxAccess}>
        <MonthlyTargetForm labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default SalesPersonWindow
