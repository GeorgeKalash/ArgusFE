import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import NodeForm from '../forms/NodeForm'
import NodesTitleForm from '../forms/NodesTitleForm'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'

const tabName = 'node'

const NodeWindow = ({ labels, maxAccess, mainRecordId, node, fetchData }) => {
  const [activeTab, setActiveTab] = useState(0)
  const tabs = [{ label: labels.node }, { label: labels.nodesTitle, disabled: !node?.current?.nodeId }]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} name={tabName} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess} name={tabName}>
        <NodeForm labels={labels} maxAccess={maxAccess} node={node} mainRecordId={mainRecordId} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess} name={tabName}>
        <NodesTitleForm maxAccess={maxAccess} labels={labels} node={node} fetchData={fetchData} />
      </CustomTabPanel>
    </>
  )
}

export default NodeWindow
