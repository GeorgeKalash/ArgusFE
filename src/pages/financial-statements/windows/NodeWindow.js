import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import NodeForm from '../forms/NodeForm'
import NodesTitleForm from '../forms/NodesTitleForm'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'

const NodeWindow = ({ labels, maxAccess, mainRecordId, node }) => {
  const [activeTab, setActiveTab] = useState(0)
  const tabs = [{ label: labels.node }, { label: labels.nodesTitle, disabled: !node?.current?.nodeId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <NodeForm labels={labels} maxAccess={maxAccess} node={node} mainRecordId={mainRecordId} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <NodesTitleForm maxAccess={maxAccess} labels={labels} node={node} />
      </CustomTabPanel>
    </>
  )
}

export default NodeWindow
