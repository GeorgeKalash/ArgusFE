import CustomTabPanel from '@argus/shared-ui/src/components/Shared/CustomTabPanel'
import StatementForm from '../forms/StatementForm'
import NodeList from '../forms/NodeList'
import LedgerForm from '../forms/LedgerForm'
import TreeForm from '../forms/TreeForm'
import { CustomTabs } from '@argus/shared-ui/src/components/Shared/CustomTabs'
import { useContext, useEffect, useRef, useState } from 'react'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { FinancialStatementRepository } from '@argus/repositories/src/repositories/FinancialStatementRepository'

const StatementWindow = ({ labels, maxAccess, recordId }) => {
  const [activeTab, setActiveTab] = useState(0)
  const [mainRecordId, setRecId] = useState(recordId)
  const node = useRef({ viewNodeId: null, viewNodeRef: '', viewNodedesc: '' })
  const { getRequest } = useContext(RequestsContext)
  const [loadedData, setLoadedData] = useState(null)

  const fetchFullFinancialStatement = async () => {
    if (!mainRecordId) return

    const res = await getRequest({
      extension: FinancialStatementRepository.FinancialStatement.get2,
      parameters: `_recordId=${mainRecordId}`
    })

    setLoadedData(res?.record)

    return res?.record
  }

  useEffect(() => {
    fetchFullFinancialStatement()
  }, [mainRecordId])

  const handleImportData = data => {
    setLoadedData(data)
    setRecId(data?.fs?.recordId)
  }

  const tabs = [
    { label: labels.financialStatement },
    { label: labels.node, disabled: !mainRecordId },
    { label: labels.ledger, disabled: !mainRecordId },
    { label: labels.tree, disabled: !mainRecordId }
  ]

  return (
    <>
      <CustomTabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} maxAccess={maxAccess} />
      <CustomTabPanel index={0} value={activeTab} maxAccess={maxAccess}>
        <StatementForm
          labels={labels}
          node={node}
          maxAccess={maxAccess}
          setRecId={setRecId}
          mainRecordId={mainRecordId}
          initialData={loadedData?.fs ?? {}}
          onImportData={handleImportData}
        />
      </CustomTabPanel>
      <CustomTabPanel index={1} value={activeTab} maxAccess={maxAccess}>
        <NodeList
          maxAccess={maxAccess}
          labels={labels}
          mainRecordId={mainRecordId}
          node={node}
          fetchData={fetchFullFinancialStatement}
          initialData={{
            nodes: loadedData?.nodes ?? [],
            titles: loadedData?.titles ?? []
          }}
        />
      </CustomTabPanel>

      <CustomTabPanel index={2} value={activeTab} maxAccess={maxAccess}>
        <LedgerForm
          maxAccess={maxAccess}
          labels={labels}
          node={node}
          mainRecordId={mainRecordId}
          initialData={loadedData}
          fetchData={fetchFullFinancialStatement}
        />
      </CustomTabPanel>

      <CustomTabPanel index={3} value={activeTab} maxAccess={maxAccess}>
        <TreeForm
          maxAccess={maxAccess}
          initialData={{
            nodes: loadedData?.nodes ?? [],
            titles: loadedData?.titles ?? []
          }}
          fetchData={fetchFullFinancialStatement}
        />
      </CustomTabPanel>
    </>
  )
}

export default StatementWindow
