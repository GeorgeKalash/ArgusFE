import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import StatementForm from '../forms/StatementForm'
import NodeList from '../forms/NodeList'
import LedgerForm from '../forms/LedgerForm'
import TreeForm from '../forms/TreeForm'
import { CustomTabs } from 'src/components/Shared/CustomTabs'
import { useContext, useRef, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { FinancialStatementRepository } from 'src/repositories/FinancialStatementRepository'

const StatementWindow = ({ labels, maxAccess, recordId }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [mainRecordId, setRecId] = useState(recordId)
  const node = useRef({ nodeId: null })

  const { getRequest } = useContext(RequestsContext)
  const [treeDataWithNodes, setTreeDataWithNodes] = useState([])

  const fetchTreeData = async (languageId = 1) => {
    if (!mainRecordId) return

    const [dataRes, labelsRes] = await Promise.all([
      getRequest({
        extension: FinancialStatementRepository.Node.qry,
        parameters: `_fsId=${mainRecordId}`
      }),
      getRequest({
        extension: FinancialStatementRepository.Title.qry,
        parameters: `_fsNodeId=0`
      })
    ])

    const filteredLabels =
      labelsRes?.list?.filter(label => label.languageId?.toString() === languageId?.toString()) ?? []

    const enrichedData =
      dataRes?.list?.map(item => ({
        ...item,
        name: filteredLabels.find(f => f.fsNodeId === item.recordId)?.title || 'undefined'
      })) ?? []

    setTreeDataWithNodes(enrichedData || [])
  }

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
        <NodeList
          maxAccess={maxAccess}
          labels={labels}
          mainRecordId={mainRecordId}
          setRecId={setRecId}
          node={node}
          fetchData={fetchTreeData}
        />
      </CustomTabPanel>
      <CustomTabPanel index={2} value={activeTab}>
        <LedgerForm maxAccess={maxAccess} labels={labels} node={node} />
      </CustomTabPanel>
      <CustomTabPanel index={3} value={activeTab}>
        <TreeForm maxAccess={maxAccess} treeDataWithNodes={treeDataWithNodes} fetchData={fetchTreeData} />
      </CustomTabPanel>
    </>
  )
}

export default StatementWindow
