import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import StatementForm from '../forms/StatementForm'
import NodeList from '../forms/NodeList'
import LedgerForm from '../forms/LedgerForm'
import TreeForm from '../forms/TreeForm'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useRef, useState } from 'react'

const StatementWindow = ({ labels, maxAccess, recordId }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [mainRecordId, setRecId] = useState(recordId)
  const node = useRef({ nodeId: null, nodeRef: null })

  const tabs = [
    { label: labels.financialStatement },
    { label: labels.node, disabled: !mainRecordId },
    { label: labels.ledger, disabled: !mainRecordId },
    { label: labels.tree, disabled: !mainRecordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <StatementForm labels={labels} maxAccess={maxAccess} setRecId={setRecId} mainRecordId={mainRecordId} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <NodeList maxAccess={maxAccess} labels={labels} mainRecordId={mainRecordId} setRecId={setRecId} node={node} />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <LedgerForm maxAccess={maxAccess} labels={labels} node={node} />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab}>
        <TreeForm maxAccess={maxAccess} mainRecordId={mainRecordId} />
      </CustomTabPanel>
    </>
  )
}

export default StatementWindow
