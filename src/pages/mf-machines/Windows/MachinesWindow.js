import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import MachinesForm from '../forms/MachinesForm'
import MachineSpecificationForm from '../forms/MachineSpecificationForm'

export default function MachinesWindow({ labels, access, recordId }) {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId
  })

  const tabs = [{ label: labels.Machines }, { label: labels.MachineSpecification, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <MachinesForm labels={labels} maxAccess={access} setStore={setStore} store={store} editMode={store.recordId}/>
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <MachineSpecificationForm labels={labels} maxAccess={access} store={store} editMode={store.recordId}/>
      </CustomTabPanel>
    </>
  )
}
