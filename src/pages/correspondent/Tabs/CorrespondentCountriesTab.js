import { Box } from '@mui/material'

// ** Custom Imports
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

const CorrespondentCountriesTab = ({
  correspondentValidation,
  countriesGridValidation,
  countriesInlineGridColumns,
  maxAccess
}) => {
  return (
    <>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <InlineEditGrid
          gridValidation={countriesGridValidation}
          columns={countriesInlineGridColumns}
          defaultRow={{
            corId: correspondentValidation.values
              ? correspondentValidation.values.recordId
                ? correspondentValidation.values.recordId
                : ''
              : '',
            countryId: '',
            countryRef: '',
            countryName: '',
            currencyName: ''
          }}
        />
      </Box>
    </>
  )
}

export default CorrespondentCountriesTab
