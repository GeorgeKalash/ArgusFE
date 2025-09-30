import { useContext, useRef, useState } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { RGGeneralRepository } from 'src/repositories/RGGeneralRepository'

function formatFinancialData(groups) {
  const listSorted = []
  const childrenMap = {}

  groups.forEach(node => {
    const parent = node.parentId || null

    if (!childrenMap[parent]) childrenMap[parent] = []
    childrenMap[parent].push(node)
  })

  function buildTree(parentId = null, level = 0) {
    const children = childrenMap[parentId] || []

    children.forEach(node => {
      const hasChildren = !!childrenMap[node.nodeId]?.length

      listSorted.push({
        nodeId: node.nodeId,
        parent: parentId,
        level,
        isExpanded: false,
        hasChildren,
        nodeName: node.nodeName,
        baseAmount: node.cellValues?.[0]?.baseAmount ?? null,
        baseFiatAmount: node.cellValues?.[0]?.baseFiatAmount ?? null,
        reportingMetalAmount: node.cellValues?.[0]?.reportingMetalAmount ?? null
      })

      if (hasChildren) {
        buildTree(node.nodeId, level + 1)
      }
    })
  }

  buildTree(null, 0)

  return listSorted
}


const FinancialStatements = () => {
  const { getRequest } = useContext(RequestsContext)
  const fullRowData = useRef([])
  const [rowData, setRowData] = useState()

  async function fetchGridData(options = {}) {
    const { params } = options

    if (params) {
      const groupsRes = await getRequest({
        extension: RGGeneralRepository.FinancialStatment.FS101,
        parameters: `_params=${params || ''}`
      })

      const groups = groupsRes?.record?.data || []

      let treeData = formatFinancialData(groups)

      const idToName = {}
      treeData.forEach(row => {
        idToName[row.nodeId] = row.nodeName
      })

      treeData = treeData.map(row => ({
        ...row,
        parent: row.parent != null ? idToName[row.parent] : null
      }))

      fullRowData.current = treeData

      const visibleRows = treeData.flatMap(row =>
        row.level === 0 ? [row, ...(row.isExpanded ? treeData.filter(child => child.parent === row.nodeName) : [])] : []
      )

      setRowData(visibleRows)

      return treeData
    }
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const {
    labels,
    filterBy,
    refetch,
    access
  } = useResourceQuery({
    queryFn: fetchGridData,
    endpointId: RGGeneralRepository.FinancialStatment.FS101,
    datasetId: ResourceIds.FinancialStatementsReport,
    filter: {
      filterFn: fetchWithFilter
    }
  })

  const columns = [
    {
      field: 'nodeName',
      headerName: '',
      flex: 1,
      isTree: true
    },
    {
      field: 'baseAmount',
      headerName: labels.baseAmount,
      flex: 1,
      type: 'number'
    },
    {
      field: 'baseFiatAmount',
      headerName: labels.baseFiatAmount,
      flex: 1,
      type: 'number'
    },
    {
      field: 'reportingMetalAmount',
      headerName: labels.reportingMetalAmount,
      flex: 1,
      type: 'number'
    }
  ]

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar hasSearch={false} labels={labels} maxAccess={access} reportName={'FS01'} filterBy={filterBy} />
      </Fixed>
      {rowData?.length > 0 && (
        <Grow>
          <Table
            name='treeTable'
            columns={columns}
            gridData={{ list: rowData }}
            rowId={['nodeId']}
            refetch={refetch}
            setRowData={setRowData}
            pagination={false}
            maxAccess={access}
            field='nodeName'
            fullRowData={fullRowData}
          />
        </Grow>
      )}
    </VertLayout>
  )
}

export default FinancialStatements
