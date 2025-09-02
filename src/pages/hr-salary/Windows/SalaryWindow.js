import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import SalaryTab from '../forms/SalaryTab'
import EntitlementsTab from '../forms/EntitlementsTab'
import DeductionsTab from '../forms/DeductionsTab'

export default function SalaryWindow({ labels, maxAccess, recordId }) {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId
  })

  const tabs = [
    { label: labels.salary },
    { label: labels.Entitlements, disabled: !store.recordId },
    { label: labels.Deductions, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <SalaryTab labels={labels} maxAccess={maxAccess} setStore={setStore} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <EntitlementsTab labels={labels} maxAccess={maxAccess} store={store} setStore={setStore} />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <DeductionsTab labels={labels} maxAccess={maxAccess} store={store} setStore={setStore} />
      </CustomTabPanel>
    </>
  )
}
