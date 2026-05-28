import Table from '@argus/shared-ui/src/components/Shared/Table'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Grid } from '@mui/material'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'
import { getFormattedNumber } from '@argus/shared-domain/src/lib/numberField-helper'

const FSAccountDetails = ({ labels, columnVisibility, columnLabels, breakDowns, access }) => {

    const parseFormattedNumber = (value) =>
        Number(
            String(getFormattedNumber(value, 0, false)).replace(/,/g, '')
        ) || 0

    const formattedBreakdowns = breakDowns.map(row => ({
        ...row,
        ...row.values,
        baseAmount: parseFormattedNumber(row.values.baseAmount || 0),
        baseFiatAmount: parseFormattedNumber(row.values.baseFiatAmount || 0),
        reportingMetalAmount: parseFormattedNumber(row.values.reportingMetalAmount || 0),
        currentRateBaseAmount: parseFormattedNumber(row.values.currentRateBaseAmount || 0),
    }))

    const totalBaseAmount = Math.round(
        formattedBreakdowns.reduce(
            (sum, row) => sum + parseFormattedNumber(row.baseAmount || 0),
            0
        )
    )

    const totalBaseFiatAmount = Math.round(
        formattedBreakdowns.reduce(
            (sum, row) => sum + parseFormattedNumber(row.baseFiatAmount || 0),
            0
        )
    )

    const totalReportingMetalAmount = Math.round(
        formattedBreakdowns.reduce(
            (sum, row) => sum + parseFormattedNumber(row.reportingMetalAmount || 0),
            0
        )
    )

    const totalCurrentRateBaseAmount = Math.round(
        formattedBreakdowns.reduce(
            (sum, row) => sum + parseFormattedNumber(row.currentRateBaseAmount || 0),
            0
        )
    )

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
            flex: 1,
        },
        {
            field: 'seg4',
            headerName: labels.seg4,
            flex: 1,
        },
        {
            field: 'ccgRef',
            headerName: labels.ccgRef,
            flex: 1,
        },
        {
            field: 'ccRef',
            headerName: labels.ccRef,
            flex: 1,
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

    const totalFields = [
    {
        field: 'baseAmount',
        label: columnLabels.baseAmount,
        value: totalBaseAmount
    },
    {
        field: 'baseFiatAmount',
        label: columnLabels.baseFiatAmount,
        value: totalBaseFiatAmount
    },
    {
        field: 'reportingMetalAmount',
        label: columnLabels.reportingMetalAmount,
        value: totalReportingMetalAmount
    },
    {
        field: 'currentRateBaseAmount',
        label: columnLabels.currentRateBaseAmount,
        value: totalCurrentRateBaseAmount
    }
    ].filter(item => columnVisibility[item.field] !== false)
    
    const hiddenCount = 4 - totalFields.length

    const leftSpacerLg = 4 + hiddenCount * 2

    return (
        <VertLayout>
            <Grow>
                <Table
                    columns={columns}
                    name='accountDetails'
                    gridData={{ list: formattedBreakdowns }}
                    rowId={['ledgerSeqNo']}
                    pagination={false}
                    maxAccess={access}
                />
            </Grow>
            <Fixed>
                <Grid container spacing={2} p={2}>
                    <Grid item xs={12} md={6} lg={leftSpacerLg} />

                    {totalFields.map(item => (
                    <Grid item xs={12} sm={6} md={3} lg={2} key={item.field}>
                        <CustomNumberField
                        label={item.label}
                        value={item.value}
                        readOnly
                        align='right'
                        />
                    </Grid>
                    ))}
                </Grid>
            </Fixed>
        </VertLayout>
    )
}

export default FSAccountDetails
