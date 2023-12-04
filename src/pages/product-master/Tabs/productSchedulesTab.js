import { Grid, Box, Checkbox } from '@mui/material'

// ** Custom Imports
import CustomTextField from 'src/components/Inputs/CustomTextField'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

const ProductSchedulesTab = ({ productMasterValidation, schedulesGridValidation, schedulesInlineGridColumns, maxAccess }) => {
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
          {/* <Grid container xs={12} spacing={2}>
            <Grid item xs={6}>
              <CustomTextField label='Reference' value={''} readOnly={true} />
            </Grid>
            <Grid item xs={6}>
              <CustomTextField label='Name' value={''} readOnly={true} />
            </Grid>
          </Grid> */}
          <Grid xs={12}>
            <InlineEditGrid
              gridValidation={schedulesGridValidation}
              columns={schedulesInlineGridColumns}
              defaultRow={{

                productId: productMasterValidation.values
                  ? productMasterValidation.values.recordId
                    ? productMasterValidation.values.recordId
                    : ''
                  : '',
                seqNo: 1,
                plantId: '',
                plantRef: '',
                plantName: '',
                countryId: '',
                countryRef: '',
                countryName: '',
                currencyId: '',
                currencyRef: '',
                currencyName: '',
                dispersalId:'',
                dispersalName:'',
                dispersalType: '',
                dispersalTypeName: '',
                isInactive: false
              }}
              width={900}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default ProductSchedulesTab
