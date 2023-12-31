import { Box } from '@mui/material'

// ** Custom Imports
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

const ProductCountriesTab = ({
  productMasterValidation,
  countriesGridValidation,
  countriesInlineGridColumns,
  maxAccess
}) => {
  return (
    <>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', scroll: 'none', overflow:'hidden' }}>
        <InlineEditGrid
          gridValidation={countriesGridValidation}
          columns={countriesInlineGridColumns}
          defaultRow={{
            productId: productMasterValidation.values
              ? productMasterValidation.values.recordId
                ? productMasterValidation.values.recordId
                : ''
              : '',
            countryId: '',
            countryRef: '',
            countryName: '',
            isInactive: false
          }}
          scrollHeight={280}
          width={900}
        />
      </Box>
    </>
  )
}

export default ProductCountriesTab
