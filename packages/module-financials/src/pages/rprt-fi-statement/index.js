import { useContext, useState } from 'react'
import { Box, IconButton } from '@mui/material'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import Image from 'next/image'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { useResourceQuery } from '@argus/shared-hooks/src/hooks/resource'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import RPBGridToolbar from '@argus/shared-ui/src/components/Shared/RPBGridToolbar'
import { RGGeneralRepository } from '@argus/repositories/src/repositories/RGGeneralRepository'
import { FinancialStatementRepository } from '@argus/repositories/src/repositories/FinancialStatementRepository'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import PrintForm from './Form/PrintForm'
import FSAccountDetails from './Form/FSAccountDetails'
import CustomCheckBox from '@argus/shared-ui/src/components/Inputs/CustomCheckBox'

const FinancialStatements = () => {
  const { getRequest } = useContext(RequestsContext)
  const [columnVisibility, setColumnVisibility] = useState({})
  const [availableCheckboxes, setAvailableCheckboxes] = useState({})
  const { stack } = useWindow()

  const [columnLabels, setColumnLabels] = useState({
    baseAmount: '',
    baseFiatAmount: '',
    reportingMetalAmount: '',
    currentRateBaseAmount: ''
  })

  const handleColumnToggle = field => event => {
    setColumnVisibility(prev => ({
      ...prev,
      [field]: event.target.checked
    }))
  }

  function formatNumber(value, numberFormat = 1) {
    if (value === null || value === undefined || value === '') return value

    const num = Number(value)
    if (isNaN(num)) return value

    const absFormatted = Math.abs(num).toLocaleString(undefined, {})

    switch (Number(numberFormat)) {
      case 1: // Unsigned: 123,456.78
        return absFormatted

      case 2: // Signed Prefix: -123,456.78
        return num < 0 ? `-${absFormatted}` : absFormatted

      case 3: // Signed Postfix: 123,456.78-
        return num < 0 ? `${absFormatted}-` : absFormatted

      case 4: // Accounting: (123,456.78)
        return num < 0 ? `(${absFormatted})` : absFormatted

      default:
        return absFormatted
    }
  }

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
        const isBold = (flags & Math.pow(2, 3)) !== 0

        const numberFormat = node.numberFormat ?? 1

        const rawBaseAmount = node.cellValues?.baseAmount ?? null
        const rawBaseFiatAmount = node.cellValues?.baseFiatAmount ?? null
        const rawReportingMetalAmount = node.cellValues?.reportingMetalAmount ?? null
        const rawCurrentRateBaseAmount = node.cellValues?.currentRateBaseAmount ?? null

        let baseAmount = hasChildren && rawBaseAmount === 0 ? '' : formatNumber(rawBaseAmount, numberFormat)
        let baseFiatAmount = hasChildren && rawBaseFiatAmount === 0 ? '' : formatNumber(rawBaseFiatAmount, numberFormat)
        let reportingMetalAmount = hasChildren && rawReportingMetalAmount === 0 ? '' : formatNumber(rawReportingMetalAmount, numberFormat)
        let currentRateBaseAmount = hasChildren && rawCurrentRateBaseAmount === 0 ? '' : formatNumber(rawCurrentRateBaseAmount, numberFormat)

        listSorted.push({
          breakDowns: node?.breakDowns,
          nodeId: node.nodeId,
          parent: parentId,
          level,
          isExpanded: true,
          hasChildren,
          isBold,
          nodeName: node.nodeName,
          baseAmount,
          baseFiatAmount,
          reportingMetalAmount,
          currentRateBaseAmount,
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

          if (bits[2] === 1 && node.cellValues) {
            const newValues = { ...node.cellValues }
            for (const key in newValues) {
              if (typeof newValues[key] === 'number') {
                newValues[key] = newValues[key] <= 0 ? -newValues[key] : -newValues[key]
              }
            }
            node.cellValues = newValues
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
      baseFiatAmount: groupsRes?.record?.baseCurrencyFiat || '',
      reportingMetalAmount: groupsRes?.record?.reportingMetalCurrencyRef || '',
      currentRateBaseAmount: groupsRes?.record?.baseCurrencyAtEndDateRate || ''
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
        const visibilityFromFS = {
          baseAmount: !!res.record.showBaseAmount,
          baseFiatAmount: !!res.record.showFiatCurrencyAmount,
          reportingMetalAmount: !!res.record.showMetalCurrencyAmount,
          currentRateBaseAmount: !!res.record.showCurrentRateBaseAmount
        }

        setColumnVisibility(visibilityFromFS)
        setAvailableCheckboxes(visibilityFromFS)
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
      width: 180,
      cellClass: 'right'
    },
    {
      field: 'baseFiatAmount',
      headerName: columnLabels.baseFiatAmount,
      width: 180,
      cellClass: 'right'
    },
    {
      field: 'reportingMetalAmount',
      headerName: columnLabels.reportingMetalAmount,
      width: 180,
      cellClass: 'right'
    },
    {
      field: 'currentRateBaseAmount',
      headerName: columnLabels.currentRateBaseAmount,
      width: 180,
      cellClass: 'right'
    }
  ]

  const baseColumns = columns.map(col => ({
    ...col,
    hide: columnVisibility[col.field] === false
  }))

  const toggleableColumns = [
    {
      field: 'baseAmount',
      label: columnLabels.baseAmount 
    },
    {
      field: 'baseFiatAmount',
      label: columnLabels.baseFiatAmount 
    },
    {
      field: 'reportingMetalAmount',
      label: columnLabels.reportingMetalAmount 
    },
    {
      field: 'currentRateBaseAmount',
      label: columnLabels.currentRateBaseAmount 
    }
  ].filter(col => availableCheckboxes[col.field] !== false)

  const finalColumns = [
    ...baseColumns,
    {
      field: 'details',
      headerName: '',
      width: 50,
      cellRenderer: params => {
        const row = params.data

        const showButton =
          !row?.isBold &&
          !row?.hasChildren &&
          !String(row?.nodeId).endsWith('_flags')

        if (!showButton) return null

        return (
          <Box sx={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
            <IconButton
              size='small'
              onClick={() => edit(row)}
            >
              <Image
                src='/images/TableIcons/popup-black.png'
                width={18}
                height={18}
                alt='Details'
              />
            </IconButton>
          </Box>
        )
      }
    }
  ]

  const hasCheckboxes =
    data?.length > 0 &&
    !!columnLabels.currentRateBaseAmount &&
    !!columnLabels.baseFiatAmount &&
    !!columnLabels.baseAmount &&
    !!columnLabels.reportingMetalAmount

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

  const edit = obj => {
    openForm(obj?.breakDowns)
  }

  function openForm(breakDowns) {
    stack({
      Component: FSAccountDetails,
      props: {
        labels,
        columnVisibility,
        columnLabels,
        breakDowns,
        access
      },
      height: 600,
      width: 1300,
      title: labels.details
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

      {hasCheckboxes && (
        <Fixed>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              p: 1
            }}
          >
            {toggleableColumns.map(col => (
              <Box key={col.field} sx={{ flex: '0 0 auto' }}>
                <CustomCheckBox
                  name={col.field}
                  label={col.label}
                  value={columnVisibility[col.field] !== false}
                  onChange={handleColumnToggle(col.field)}
                />
              </Box>
            ))}
          </Box>
        </Fixed>
      )}

      {data?.length > 0 && (
        <Grow>
          <Table
            name='table'
            columns={finalColumns}
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
