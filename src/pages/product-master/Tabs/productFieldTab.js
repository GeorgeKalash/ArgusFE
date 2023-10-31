// ** MUI Imports
import { Grid, Box } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

const ProductFieldTab = ({ productFieldGridData, dispersalStore, maxAccess }) => {
  //stores

  const columns = [
    {
      field: 'controls',
      headerName: 'Controls',
      flex: 1
    },
    {
      field: 'format',
      headerName: 'Format',
      flex: 1
    },
    {
      field: 'securityLevel',
      headerName: 'securityLevel',
      flex: 1
    },
    {
      field: 'specialChars',
      headerName: 'special Chars',
      flex: 1
    },
    {
      field: 'fixedLength',
      headerName: 'fixed Length',
      flex: 1
    },
    {
      field: 'minLength',
      headerName: 'min Length',
      flex: 1
    },
    {
      field: 'maxLength',
      headerName: 'max Length',
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
              gridData={productFieldGridData}
              rowId={['recordId']}
              isLoading={false}
              pagination={false}
              height={220}
              maxAccess={maxAccess} 
            />
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default ProductFieldTab
