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
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

const productLegTab = ({
  productLegValidation,
  scheduleRangeGridValidation,
  scheduleRangeInlineGridColumns,
  currencyStore,
  countryStore,
  plantStore,
  dispersalStore,
  maxAccess
}) => {

// console.log(currencyStore)
// console.log(plantStore)
// console.log(countryStore)


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
          <Grid container xs={12} spacing={3}>
         {productLegValidation.values && productLegValidation.values.plantId &&  plantStore &&  <Grid item xs={3} >
              <CustomComboBox
                name='plantId'
                label='Plant'
                valueField='recordId'
                displayField='name'

                readOnly={true}
                store={plantStore}
                value={ plantStore &&
                  plantStore.filter(
                    item => item.recordId === (productLegValidation.values && productLegValidation.values.plantId)
                  )[0]
                }
                onChange={(event, newValue) => {
                  productLegValidation.setFieldValue('plantId', newValue?.recordId)
                  console.log(productLegValidation)
                }}
                error={productLegValidation.touched.plantId && Boolean(productLegValidation.errors.plantId)}
                helperText={productLegValidation.touched.plantId && productLegValidation.errors.plantId}
              />
            </Grid>}
            {productLegValidation.values && productLegValidation.values.countryId &&   <Grid item xs={3}>
              <CustomComboBox
                name='countryId'
                label='Country'
                valueField='recordId'
                displayField='name'
                readOnly={true}
                store={countryStore}
                value={ countryStore &&
                  countryStore.filter(
                    item => item.recordId === (productLegValidation.values && productLegValidation.values.countryId)
                  )[0]
                }
                onChange={(event, newValue) => {
                  productLegValidation.setFieldValue('countryId', newValue?.recordId)
                }}
                error={productLegValidation.touched.countryId && Boolean(productLegValidation.errors.countryId)}
                helperText={productLegValidation.touched.countryId && productLegValidation.errors.countryId}
              />
            </Grid>}
           {productLegValidation.values && productLegValidation.values.currencyId && <Grid item xs={3}>
              <CustomComboBox
                name='currencyId'
                label='Currency'
                valueField='recordId'
                displayField='name'
                readOnly={true}
                store={currencyStore}
                value={ currencyStore &&
                  currencyStore.filter(
                    item => item.recordId === (productLegValidation.values && productLegValidation.values.currencyId)
                  )[0]
                }
                onChange={(event, newValue) => {
                  productLegValidation.setFieldValue('currencyId', newValue?.recordId)
                }}
                error={productLegValidation.touched.currencyId && Boolean(productLegValidation.errors.currencyId)}
                helperText={productLegValidation.touched.currencyId && productLegValidation.errors.currencyId}
              />
            </Grid>}

          {productLegValidation.values  && productLegValidation.values.dispersalId && <Grid item xs={3}>
              <CustomComboBox
                name='dispersalId'
                label='Dispersal'
                valueField='recordId'
                displayField='name'
                readOnly={true}
                store={dispersalStore}
                value={dispersalStore && dispersalStore.filter(item => item.recordId === productLegValidation.values.dispersalId)[0]}
                onChange={(event, newValue) => {
                  productLegValidation.setFieldValue('dispersalId', newValue?.recordId)
                }}
                error={productLegValidation.touched.dispersalId && Boolean(productLegValidation.errors.dispersalId)}
                helperText={productLegValidation.touched.dispersalId && productLegValidation.errors.dispersalId}
              />
            </Grid>}
          </Grid>
          <Grid xs={12}>
            <InlineEditGrid
              gridValidation={scheduleRangeGridValidation}
              columns={scheduleRangeInlineGridColumns}
              defaultRow={{
                productId: productLegValidation.values
                  ? productLegValidation.values.productId
                    ? productLegValidation.values.productId
                    : ''
                  : '',
                seqNo: productLegValidation.values
                  ? productLegValidation.values.seqNo
                    ? productLegValidation.values.seqNo
                    : ''
                  : '',
                rangeSeqNo: 1, //incremental
                fromAmount: '',
                toAmount: ''
              }}
              width={900}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default productLegTab
