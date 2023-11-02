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
  productLegValidation,
  productLegWindowOpen,
  productLegGridData,
  productLegCommissionGridData,
  editProductCommission,
  setProductLegWindowOpen,
  currencyStore,
  plantStore,
  dispersalStore,
  maxAccess
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
              <CustomTextField label='Reference' value={''} readOnly={true} />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField label='Name' value={''} readOnly={true} />
            </Grid>
            <Grid item xs={4}>
              <CustomComboBox
              name='plantId'
              label='Plant'
              valueField='recordId'
              displayField='name'
              store={plantStore}
              value={plantStore.filter(item => item.recordId === productLegValidation.values.plantId)[0]}
              onChange={(event, newValue) => {
                productLegValidation.setFieldValue('plantId', newValue?.recordId)
              }}
              error={
                productLegValidation.touched.plantId && Boolean(productLegValidation.errors.plantId)
              }
              helperText={productLegValidation.touched.plantId && productLegValidation.errors.plantId}
            />
            </Grid>
            <Grid item xs={4}>
            <CustomComboBox
              name='currencyId'
              label='Currency'
              valueField='recordId'
              displayField='name'
              store={currencyStore}
              value={currencyStore.filter(item => item.recordId === productLegValidation.values.currencyId)[0]}
              onChange={(event, newValue) => {
                productLegValidation.setFieldValue('currencyId', newValue?.recordId)
              }}
              error={
                productLegValidation.touched.currencyId && Boolean(productLegValidation.errors.currencyId)
              }
              helperText={productLegValidation.touched.currencyId && productLegValidation.errors.currencyId}
            />
            </Grid>
            <Grid item xs={4}>
              <CustomComboBox name='dispersalId'
              label='Dispersal'
              valueField='recordId'
              displayField='name'
              store={dispersalStore}
              value={dispersalStore.filter(item => item.recordId === productLegValidation.values.dispersalId)[0]}
              onChange={(event, newValue) => {
                productLegValidation.setFieldValue('dispersalId', newValue?.recordId)
              }}
              error={
                productLegValidation.touched.dispersalId && Boolean(productLegValidation.errors.dispersalId)
              }
              helperText={productLegValidation.touched.dispersalId && productLegValidation.errors.dispersalId}
               />
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
              maxAccess={maxAccess} 
            />
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default productLegTab
