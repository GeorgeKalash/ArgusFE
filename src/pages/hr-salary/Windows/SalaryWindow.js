import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import SalaryTab from '../forms/SalaryTab'
import EntitlementsTab from '../forms/EntitlementsTab'
import DeductionsTab from '../forms/DeductionsTab'

export default function SalaryWindow({ labels, maxAccess, recordId, employeeInfo }) {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId,
    currency: ''
  })

  const tabs = [
    { label: labels.salary },
    { label: labels.entitlements, disabled: !store.recordId },
    { label: labels.deductions, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <SalaryTab
          labels={labels}
          maxAccess={maxAccess}
          setStore={setStore}
          store={store}
          employeeInfo={employeeInfo}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <EntitlementsTab labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <DeductionsTab labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}
