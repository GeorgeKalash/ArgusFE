import { useContext } from 'react'
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
    const parent = node.parentId ?? null
    if (!childrenMap[parent]) childrenMap[parent] = []
    childrenMap[parent].push(node)
  })

  function buildTree(parentId = null, level = 0) {
    const children = childrenMap[parentId] || []

    children.forEach(node => {
      const hasChildren = !!childrenMap[node.nodeId]?.length

      const flags = node.flags ?? 0
      const bits = []
      for (let i = 0; i < 32; i++) {
        bits.push((flags >> i) & 1)
      }

      listSorted.push({
        nodeId: node.nodeId,
        parent: parentId,
        level,
        isExpanded: true,
        hasChildren,
        nodeName: node.nodeName,
        baseAmount: node.cellValues?.[0]?.baseAmount ?? null,
        baseFiatAmount: node.cellValues?.[0]?.baseFiatAmount ?? null,
        reportingMetalAmount: node.cellValues?.[0]?.reportingMetalAmount ?? null,
        flags
      })

      if (hasChildren) {
        buildTree(node.nodeId, level + 1)
      }

      if (bits[0] === 1 || bits[1] === 1) {
        listSorted.push({
          nodeId: `${node.nodeId}_flags`,
          parent: node.nodeId,
          level,
          isExpanded: false,
          hasChildren: false,
          nodeName: ' ',
          baseAmount: null,
          baseFiatAmount: null,
          reportingMetalAmount: null,
          flags
        })

        if (bits[2] === 1 && node.cellValues?.[0]) {
          const newValues = { ...node.cellValues[0] }
          for (const key in newValues) {
            if (typeof newValues[key] === 'number') {
              newValues[key] = newValues[key] <= 0 ? -newValues[key] : -newValues[key]
            }
          }
          node.cellValues[0] = newValues
        }

        node.flags = 0
      }
    })
  }

  buildTree(null, 0)

  return listSorted
}

const FinancialStatements = () => {
  const { getRequest } = useContext(RequestsContext)

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

      return treeData
    }
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const {
    query: { data },
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
      {data?.length > 0 && (
        <Grow>
          <Table
            name='table'
            columns={columns}
            gridData={{ list: data }}
            rowId={['nodeId']}
            refetch={refetch}
            pagination={false}
            collabsable={false}
            maxAccess={access}
            field='nodeName'
            fullRowData={data}
          />
        </Grow>
      )}
    </VertLayout>
  )
}

export default FinancialStatements
