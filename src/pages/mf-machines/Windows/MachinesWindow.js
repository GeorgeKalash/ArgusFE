import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import MachinesForm from '../forms/MachinesForm'
import MachineSpecificationForm from '../forms/MachineSpecificationForm'

export default function MachinesWindow({ labels, maxAccess, recordId }) {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId
  })

  const tabs = [{ label: labels.Machines }, { label: labels.MachineSpecification, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <MachinesForm labels={labels} maxAccess={maxAccess} setStore={setStore} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <MachineSpecificationForm labels={labels} maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}
