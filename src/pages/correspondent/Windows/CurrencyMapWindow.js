// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import Table from 'src/components/Shared/Table'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'
import { RemittanceSettingsRepository } from 'src/repositories/RemittanceRepository'

const CurrencyMapWindow = ({
  onClose,
  onSave,
  exchangeMapsGridValidation,
  exchangeMapsInlineGridColumns,
  countriesGridValidation,
  exchangeMapValidation,
  currenciesGridValidation,
  countryStore,
  getCurrenciesExchangeMaps,
  maxAccess
}) => {
  console.log(countriesGridValidation)
  console.log(exchangeMapsGridValidation)
  console.log(currenciesGridValidation)

  return (
    <Window id='CurrencyMapsWindow' Title='Exchange Map' onClose={onClose} onSave={onSave} width={500} height={400}>
      <CustomTabPanel index={0} value={0}>
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
                <CustomComboBox
                  name='countryId'
                  label='Country'
                  valueField='recordId'
                  displayField='name'
                  store={countryStore}
                  value={countryStore.filter(item => item.recordId === exchangeMapValidation.values.countryId)[0]} // Ensure the value matches an option or set it to null
                  required
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    exchangeMapValidation.setFieldValue('countryId', newValue?.recordId)
                    const selectedCountryId = newValue?.recordId || ''
                    getCurrenciesExchangeMaps(
                      currenciesGridValidation.values.rows[0].corId,
                      currenciesGridValidation.values.rows[0].currencyId,
                      selectedCountryId
                    ) // Fetch and update state data based on the selected country
                  }}
                  error={exchangeMapValidation.touched.countryId && Boolean(exchangeMapValidation.errors.countryId)}
                  helperText={exchangeMapValidation.touched.countryId && exchangeMapValidation.errors.countryId}
                />
              </Grid>
            </Grid>
            {/* {exchangeMapValidation.values.currencyId > 0 && ( */}
            <Grid xs={12}>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                <InlineEditGrid
                  gridValidation={exchangeMapsGridValidation}
                  columns={exchangeMapsInlineGridColumns}
                  defaultRow={{
                    corId: currenciesGridValidation.values.rows[0].corId,
                    currencyId: currenciesGridValidation.values.rows[0].currencyId,
                    countryId: exchangeMapValidation.values.countryId,
                    plantId: '',
                    exchangeId: ''
                  }}
                  width={500}
                />
              </Box>
            </Grid>
            {/* )} */}
          </Grid>
        </Box>
      </CustomTabPanel>
    </Window>
  )
}

export default CurrencyMapWindow
