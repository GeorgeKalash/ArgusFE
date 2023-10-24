// ** MUI Imports
import { Grid, Box, Checkbox } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import Window from 'src/components/Shared/Window'

// ** Helpers
import { getFormattedNumber } from 'src/lib/numberField-helper'

const productLegTab = ({
  productLegWindowOpen,
  productLegGridData,
  productLegCommissionGridData,
  editProductCommission,
  setProductLegWindowOpen
}) => {
  const columns = [
    {
      field: 'fromAmount',
      headerName: 'From Amount',
      flex: 1,
      align: 'right',
      valueGetter: ({ row }) => getFormattedNumber(row?.fromAmount, 2)
    },
    {
      field: 'toAmount',
      headerName: 'To Amount',
      flex: 1,
      align: 'right',
      valueGetter: ({ row }) => getFormattedNumber(row?.toAmount, 2)
    }
  ]

  const commissionColumns = [
    {
      field: 'checkBox',
      headerName: '',
      flex: 0.5,
      renderCell: params => (
        <Checkbox
          color='primary'
          checked={params.row.checkBox === true}
          onChange={() => {
            params.row.checkBox = !params.row.checkBox
          }}
        />
      )
    },
    {
      field: 'commissionName',
      headerName: 'Commission Name',
      flex: 1
    },
    {
      field: 'commission',
      headerName: 'Commission',
      flex: 1
    }
  ]

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <Grid container>
          {/* First Column */}
          <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
            <Grid item xs={12}>
              <CustomTextField label='Reference' value={'reference 1'} readOnly={true} />
            </Grid>
            <Grid item xs={12}>
              <CustomComboBox name='plantName' label='Plant' readOnly={false} required />
            </Grid>
            <Grid item xs={12}>
              <CustomComboBox name='dispursal' label='Dispursal' readOnly={false} required />
            </Grid>
          </Grid>
          {/* Second Column */}
          <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
            <Grid item xs={12}>
              <CustomTextField label='Name' value={'name 1'} readOnly={true} />
            </Grid>
            <Grid item xs={12}>
              <CustomComboBox name='currencyName' label='Currency' required />
            </Grid>
          </Grid>
        </Grid>
        <Table
          columns={columns}
          gridData={productLegGridData}
          rowId={['recordId']}
          onEdit={editProductCommission}
          isLoading={false}
          pagination={false}
          actionColumnHeader='Commissions'
          height={180}
        />
      </Box>
    </>
  )
}

export default productLegTab
