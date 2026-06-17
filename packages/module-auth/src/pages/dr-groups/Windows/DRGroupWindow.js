import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useState } from 'react'
import DRGroupForm from '../forms/DRGroupForm'
import ApproverList from '../forms/ApproverList'

const DRGroupWindow = ({ height, recordId, labels, maxAccess }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId: recordId || null
  })

  const tabs = [
    { label: labels.group },
    { label: labels.approver, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel height={height} index={0} value={activeTab} maxAccess={maxAccess}>
        <DRGroupForm labels={labels} store={store} setStore={setStore} maxAccess={maxAccess} />
      </CustomTabPanel>
      <CustomTabPanel height={height} index={1} value={activeTab} maxAccess={maxAccess}>
        <ApproverList labels={labels} store={store} setStore={setStore} maxAccess={maxAccess} />
      </CustomTabPanel>
    </>
  )
}

export default DRGroupWindow