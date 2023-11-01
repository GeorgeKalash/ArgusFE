import { Grid, Box } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

const PoductCurrenciesTab = ({ productCurrenciesGridData, dispersalStore, maxAccess }) => {
  const columns = [
    {
      field: 'Currency',
      headerName: 'Currencies',
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
            <Grid item xs={6}>
              <CustomComboBox name='dispersalId'
              label='Dispersal'
              valueField='recordId'
              displayField='name'
              store={dispersalStore}
              required='true'
              />
            </Grid>
          </Grid>
          <Grid xs={12}>
            <Table
              columns={columns}
              gridData={productCurrenciesGridData}
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

export default PoductCurrenciesTab
