import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import { useState } from 'react'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import CostGroupForm from '../Tabs/CostGroupForm'
import OverheadsForm from '../Tabs/OverheadsForm'

export default function CostGroupWindow({ labels, access, recordId }) {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId,
    isClosed: false
  })

  const tabs = [{ label: labels.costGroup }, { label: labels.overheads, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <CostGroupForm labels={labels} access={access} setStore={setStore} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <OverheadsForm access={access} labels={labels} store={store} />
      </CustomTabPanel>
    </>
  )
}
