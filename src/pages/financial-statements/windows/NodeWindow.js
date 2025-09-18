import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import NodeForm from '../forms/NodeForm'
import NodesTitleForm from '../forms/NodesTitleForm'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'

const NodeWindow = ({ labels, maxAccess, recordId, fsId, getGridData }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId,
    fsId
  })

  const tabs = [{ label: labels.node }, { label: labels.nodesTitle, disabled: !store.recordId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <NodeForm labels={labels} maxAccess={maxAccess} setStore={setStore} store={store} getGridData={getGridData} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <NodesTitleForm maxAccess={maxAccess} labels={labels} store={store} setStore={setStore} />
      </CustomTabPanel>
    </>
  )
}

export default NodeWindow
