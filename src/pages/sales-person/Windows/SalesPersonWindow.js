import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import GeneralForm from 'src/pages/sales-person/Forms/GeneralForm'
import { useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
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
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <GeneralForm labels={labels} maxAccess={maxAccess} store={store} setStore={setStore} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <TargetForm labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <MonthlyTargetForm labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default SalesPersonWindow
