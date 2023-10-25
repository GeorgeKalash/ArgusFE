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
        <Grid container gap={2}>
          <Grid container xs={12} spacing={2}>
            <Grid item xs={6}>
              <CustomTextField label='Reference' value={'reference 1'} readOnly={true} />
            </Grid>
            <Grid item xs={6}>
              <CustomComboBox name='plantName' label='Plant' readOnly={false} required />
            </Grid>
            <Grid item xs={6}>
              <CustomComboBox name='dispersal' label='Dispersal' readOnly={false} required />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField label='Name' value={'name 1'} readOnly={true} />
            </Grid>
            <Grid item xs={6}>
              <CustomComboBox name='currencyName' label='Currency' required />
            </Grid>
          </Grid>
          <Grid xs={12}>
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
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default productLegTab
