// ** MUI Imports
import { Grid, Box } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

const ProductFieldTab = ({ productFieldGridData }) => {
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
        <Grid container>
          {/* First Column */}
          <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
            <Grid item xs={12}>
              <CustomTextField label='Reference' value={'reference 1'} readOnly={true} />
            </Grid>
            <Grid item xs={12}>
              <CustomComboBox name='dispersal' label='Dispersal' readOnly={false} required />
            </Grid>
          </Grid>
          {/* Second Column */}
          <Grid ccontainer rowGap={2} xs={6} sx={{ px: 2 }}>
            <Grid item xs={12}>
              <CustomTextField label='Name' value={'name 1'} readOnly={true} />
            </Grid>
          </Grid>
        </Grid>
        <Table
          columns={columns}
          gridData={productFieldGridData}
          rowId={['recordId']}
          isLoading={false}
          pagination={false}
          height={220}
        />
      </Box>
    </>
  )
}

export default ProductFieldTab
