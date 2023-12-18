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

const ExchangeMapWindow = ({
  onClose,
  onSave,
  countriesGridValidation,
  exchangeMapsGridValidation,
  exchangeMapsInlineGridColumns,
  exchangeMapValidation,
  currencyStore,
  countryStore,
  getCurrenciesExchangeMaps,
  maxAccess,
  labels
}) => {

return (
    <Window id='CurrencyMapsWindow' Title={labels.exchangeMap} onClose={onClose} onSave={onSave} width={800} height={400}>
      <CustomTabPanel index={0} value={0}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',

          }}
        >
          <Grid container gap={2}>
            <Grid container xs={12} spacing={2}>
              <Grid item xs={6}>
                <CustomComboBox
                  name='currencyId'
                  label={labels.currency}
                  valueField='recordId'
                  displayField={['reference', 'name']}
                  readOnly='true'
                  store={currencyStore}
                  value={currencyStore.filter(item => item.recordId === exchangeMapValidation.values.currencyId)[0]} // Ensure the value matches an option or set it to null
                  required
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    exchangeMapValidation.setFieldValue('currencyId', newValue?.recordId)
                  }}
                  error={exchangeMapValidation.touched.currencyId && Boolean(exchangeMapValidation.errors.currencyId)}
                  helperText={exchangeMapValidation.touched.currencyId && exchangeMapValidation.errors.currencyId}
                />
              </Grid>
              <Grid item xs={6}>
                <CustomComboBox
                  name='countryId'
                  label={labels.country}
                  valueField='countryId'
                  displayField={['countryRef', 'countryName']}
                  columnsInDropDown= {[
                    { key: 'countryRef', value: 'Reference' },
                    { key: 'countryName', value: 'Name' },
                  ]}

                  // displayField='countryName'
                  store={countriesGridValidation.values.rows}
                  value={countriesGridValidation.values.rows.filter(item => item.countryId === exchangeMapValidation.values.countryId)[0]} // Ensure the value matches an option or set it to null
                  required
                  maxAccess={maxAccess}
                  onChange={(event, newValue) => {
                    exchangeMapValidation.setFieldValue('countryId', newValue?.countryId)
                    const selectedCountryId = newValue?.countryId || ''
                    getCurrenciesExchangeMaps(
                      exchangeMapValidation.values.corId,
                      exchangeMapValidation.values.currencyId,
                      selectedCountryId
                    ) // Fetch and update state data based on the selected country
                  }}

                  error={exchangeMapValidation.touched.countryId && Boolean(exchangeMapValidation.errors.countryId)}
                  helperText={exchangeMapValidation.touched.countryId && exchangeMapValidation.errors.countryId}
                />
              </Grid>
            </Grid>
            <Grid xs={12}>
              <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                {exchangeMapValidation.values.countryId && (
                  <InlineEditGrid
                    gridValidation={exchangeMapsGridValidation}
                    columns={exchangeMapsInlineGridColumns}
                    defaultRow={{
                      corId: exchangeMapValidation.values.corId,
                      currencyId: exchangeMapValidation.values.currencyId,
                      countryId: exchangeMapValidation.values.countryId,
                      plantId: '',
                      exchangeId: '',
                      exchangeRef: '',
                      exchangeName: ''
                    }}
                    allowDelete={false}
                    allowAddNewLine={false}
                    width={800}
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CustomTabPanel>
    </Window>
  )
}

export default ExchangeMapWindow
