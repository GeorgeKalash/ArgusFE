import { Grid, Box, Checkbox } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import CustomTextField from 'src/components/Inputs/CustomTextField'

const ProductCountriesTab = ({ productCountriesGridData, maxAccess }) => {
  const columns = [
    {
      field: 'country',
      headerName: 'Country',
      flex: 1
    },
    {
      field: 'isInactive',
      headerName: 'Is Inactive',
      flex: 1,
      renderCell: params => (
        <Checkbox
          color='primary'
          checked={params.row.isInactive === true}
          onChange={() => {
            params.row.isInactive = !params.row.isInactive
          }}
        />
      )
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
          </Grid>
          <Grid xs={12}>
            <Table
              columns={columns}
              gridData={productCountriesGridData}
              rowId={['recordId']}
              isLoading={false}
              pagination={false}
              height={220}
              maxAccess={maxAccess} 
            />
            {/* <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', }}>
              <InlineEditGrid columns={columns}/>
            </Box> */}
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default ProductCountriesTab
