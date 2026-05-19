import { Box } from '@mui/material'
import Table from '@argus/shared-ui/src/components/Shared/Table'
import React from 'react'

const FSAccountDetails = ({
  labels,
  columnVisibility,
  columnLabels,
  breakDowns,
  access
}) => {
  const formattedBreakdowns = breakDowns?.map(row => ({
    ...row,
    ...row.values
  }))

  const baseColumns = [
    {
      field: 'seg0',
      headerName: labels.seg0,
      flex: 1
    },
    {
      field: 'seg1',
      headerName: labels.seg1,
      flex: 1
    },
    {
      field: 'seg2',
      headerName: labels.seg2,
      flex: 1
    },
    {
      field: 'seg3',
      headerName: labels.seg3,
      flex: 1
    },
    {
      field: 'seg4',
      headerName: labels.seg4,
      flex: 1
    },
    {
      field: 'ccgRef',
      headerName: labels.ccgRef,
      flex: 1
    },
    {
      field: 'ccRef',
      headerName: labels.ccRef,
      flex: 1
    },
    {
      field: 'baseAmount',
      headerName: columnLabels.baseAmount,
      flex: 1.5,
      type: { field: 'number', decimal: 0 }
    },
    {
      field: 'baseFiatAmount',
      headerName: columnLabels.baseFiatAmount,
      flex: 1.5,
      type: { field: 'number', decimal: 0 }
    },
    {
      field: 'reportingMetalAmount',
      headerName: columnLabels.reportingMetalAmount,
      flex: 1.5,
      type: { field: 'number', decimal: 0 }
    },
    {
      field: 'currentRateBaseAmount',
      headerName: columnLabels.currentRateBaseAmount,
      flex: 1.5,
      type: { field: 'number', decimal: 0 }
    }
  ]

  const columns = baseColumns.map(col => ({
    ...col,
    hide: columnVisibility[col.field] === false
  }))

  console.log(columns)

  return (
    <Box
      sx={{
        ml: 4,
        my: 1,
        p: 2,
        border: '1px solid #d9d9d9',
        borderRadius: 1,
        backgroundColor: '#fafafa'
      }}
    >
      <Table
        columns={columns}
        name='accountDetails'
        gridData={{ list: formattedBreakdowns }}
        rowId={['ledgerSeqNo']}
        pagination={false}
        maxAccess={access}
        disableSorting
        domLayout="autoHeight"
      />
    </Box>
  )
}

export default React.memo(FSAccountDetails)