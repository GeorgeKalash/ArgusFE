import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import StatementForm from '../forms/StatementForm'
import NodeList from '../forms/NodeList'
import LedgerForm from '../forms/LedgerForm'
import TreeForm from '../forms/TreeForm'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useState } from 'react'

const StatementWindow = ({ labels, maxAccess, recordId }) => {
  const [activeTab, setActiveTab] = useState(0)

  const [store, setStore] = useState({
    recordId,
    nodeRef: null,
    nodeId: null
  })

  const tabs = [
    { label: labels.financialStatement },
    { label: labels.node, disabled: !store.recordId },
    { label: labels.ledger, disabled: !store.recordId },
    { label: labels.tree, disabled: !store.recordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />
      <CustomTabPanel index={0} value={activeTab}>
        <StatementForm labels={labels} maxAccess={maxAccess} setStore={setStore} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab}>
        <NodeList maxAccess={maxAccess} labels={labels} store={store} setStore={setStore} />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <LedgerForm maxAccess={maxAccess} labels={labels} store={store} />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab}>
        <TreeForm maxAccess={maxAccess} store={store} />
      </CustomTabPanel>
    </>
  )
}

export default StatementWindow
