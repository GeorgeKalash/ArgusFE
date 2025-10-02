import { useContext, useState } from 'react'
import Table from 'src/components/Shared/Table'
import { RequestsContext } from 'src/providers/RequestsContext'
import { useResourceQuery } from 'src/hooks/resource'
import { ResourceIds } from 'src/resources/ResourceIds'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'
import RPBGridToolbar from 'src/components/Shared/RPBGridToolbar'
import { RGGeneralRepository } from 'src/repositories/RGGeneralRepository'
import { FinancialStatementRepository } from 'src/repositories/FinancialStatementRepository'
import { useWindow } from 'src/windows'
import PrintForm from './Form/PrintForm'

const FinancialStatements = () => {
  const { getRequest } = useContext(RequestsContext)
  const [columnVisibility, setColumnVisibility] = useState({})
  const { stack } = useWindow()

  const [columnLabels, setColumnLabels] = useState({
    baseAmount: '',
    baseFiatAmount: '',
    reportingMetalAmount: '',
    currentRateBaseAmount: ''
  })

  function formatFinancialData(groups) {
    const listSorted = []

    const childrenMap = groups.reduce((map, node) => {
      const parent = node.parentId ?? null
      if (!map[parent]) map[parent] = []
      map[parent].push(node)

      return map
    }, {})

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
          currentRateBaseAmount: node.cellValues?.[0]?.currentRateBaseAmount ?? null,
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
            currentRateBaseAmount: null,
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

  async function fetchGridData(options = {}) {
    const { params } = options

    if (!params) return

    const paramPairs = params.split('^').map(p => p.split('|'))
    const paramMap = Object.fromEntries(paramPairs)
    const mainRecordId = paramMap['4']

    const groupsRes = await getRequest({
      extension: RGGeneralRepository.FinancialStatment.FS101,
      parameters: `_params=${params}`
    })

    setColumnLabels({
      baseAmount: groupsRes?.record?.baseCurrencyRef || '',
      baseFiatAmount: groupsRes?.record?.baseCurrencyRef || '',
      reportingMetalAmount: groupsRes?.record?.reportingMetalCurrencyRef || '',
      currentRateBaseAmount: groupsRes?.record?.reportingMetalCurrencyRef || ''
    })

    const groups = groupsRes?.record?.data || []
    let treeData = formatFinancialData(groups)

    const idToName = Object.fromEntries(treeData.map(({ nodeId, nodeName }) => [nodeId, nodeName]))

    if (mainRecordId) {
      const res = await getRequest({
        extension: FinancialStatementRepository.FinancialStatement.get,
        parameters: `_recordId=${mainRecordId}`
      })

      if (res?.record) {
        setColumnVisibility({
          baseAmount: !!res.record.showBaseAmount,
          baseFiatAmount: !!res.record.showFiatCurrencyAmount,
          reportingMetalAmount: !!res.record.showMetalCurrencyAmount,
          currentRateBaseAmount: !!res.record.showCurrentRateBaseAmount
        })
      }
    }

    return treeData.map(row => ({
    ...row,
    parent: row.parent != null ? idToName[row.parent] : null
  }))
  }

  async function fetchWithFilter({ filters, pagination }) {
    return fetchGridData({ _startAt: pagination._startAt || 0, params: filters?.params })
  }

  const {
    query: { data },
    labels,
    filterBy,
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
      width: 'auto',
      isTree: true
    },
    {
      field: 'baseAmount',
      headerName: columnLabels.baseAmount,
      width: 150,
      type: 'number'
    },
    {
      field: 'baseFiatAmount',
      headerName: columnLabels.baseFiatAmount,
      width: 150,
      type: 'number'
    },
    {
      field: 'reportingMetalAmount',
      headerName: columnLabels.reportingMetalAmount,
      width: 150,
      type: 'number'
    },
    {
      field: 'currentRateBaseAmount',
      headerName: columnLabels.currentRateBaseAmount,
      width: 150,
      type: 'number'
    }
  ]

  const baseColumns = columns.map(col => ({
    ...col,
    hide: columnVisibility[col.field] === false
  }))

  const Print = rpbParams => {
    if (!data?.length) return

    stack({
      Component: PrintForm,
      props: {
        tableData: data,
        rpbParams: rpbParams,
        columns: baseColumns,
        labels
      },
      width: 1200,
      height: 600,
      title: labels.Print
    })
  }

  return (
    <VertLayout>
      <Fixed>
        <RPBGridToolbar
          hasSearch={false}
          labels={labels}
          maxAccess={access}
          reportName={'FS01'}
          filterBy={filterBy}
          Print={Print}
          disablePrint={!data?.length}
        />
      </Fixed>
      {data?.length > 0 && (
        <Grow>
          <Table
            name='table'
            columns={baseColumns}
            gridData={{ list: data }}
            rowId={['nodeId']}
            pagination={false}
            collabsable={false}
            maxAccess={access}
            field='nodeName'
            disableSorting
            fullRowData={data}
          />
        </Grow>
      )}
    </VertLayout>
  )
}

export default FinancialStatements
