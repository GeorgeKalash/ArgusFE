import Table from '@argus/shared-ui/src/components/Shared/Table'
import { VertLayout } from '@argus/shared-ui/src/components/Layouts/VertLayout'
import { Grow } from '@argus/shared-ui/src/components/Layouts/Grow'
import { Grid } from '@mui/material'
import { Fixed } from '@argus/shared-ui/src/components/Layouts/Fixed'
import CustomNumberField from '@argus/shared-ui/src/components/Inputs/CustomNumberField'

const FSAccountDetails = ({ labels, columnVisibility, columnLabels, breakDowns, access }) => {

    const formattedBreakdowns = breakDowns.map(row => ({
        ...row,
        ...row.values
    }))

    const totalBaseAmount = formattedBreakdowns.reduce(
        (sum, row) => sum + Number(row.baseAmount || 0),
        0
    )

    const totalBaseFiatAmount = formattedBreakdowns.reduce(
        (sum, row) => sum + Number(row.baseFiatAmount || 0),
        0
    )

    const totalReportingMetalAmount = formattedBreakdowns.reduce(
        (sum, row) => sum + Number(row.reportingMetalAmount || 0),
        0
    )

    const totalCurrentRateBaseAmount = formattedBreakdowns.reduce(
        (sum, row) => sum + Number(row.currentRateBaseAmount || 0),
        0
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
            type: 'number'
        },
        {
            field: 'baseFiatAmount',
            headerName: columnLabels.baseFiatAmount,
            flex: 1.5,
            type: 'number'
        },
        {
            field: 'reportingMetalAmount',
            headerName: columnLabels.reportingMetalAmount,
            flex: 1.5,
            type: 'number'
        },
        {
            field: 'currentRateBaseAmount',
            headerName: columnLabels.currentRateBaseAmount,
            flex: 1.5,
            type: 'number'
        }
    ]

    const columns = baseColumns.map(col => ({
        ...col,
        hide: columnVisibility[col.field] === false
    }))
    

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
                    <Grid item xs={12} md={6} lg={4} />

                    <Grid item xs={12} sm={6} md={3} lg={2}>
                    <CustomNumberField
                        label={columnLabels.baseAmount}
                        value={totalBaseAmount}
                        readOnly
                        align='right'
                    />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3} lg={2}>
                    <CustomNumberField
                        label={columnLabels.baseFiatAmount}
                        value={totalBaseFiatAmount}
                        readOnly
                        align='right'
                    />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3} lg={2}>
                    <CustomNumberField
                        label={columnLabels.reportingMetalAmount}
                        value={totalReportingMetalAmount}
                        readOnly
                        align='right'
                    />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3} lg={2}>
                    <CustomNumberField
                        label={columnLabels.currentRateBaseAmount}
                        value={totalCurrentRateBaseAmount}
                        readOnly
                        align='right'
                    />
                    </Grid>
                </Grid>
            </Fixed>
        </VertLayout>
    )
}

export default FSAccountDetails
