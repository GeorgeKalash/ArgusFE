import { Box } from '@mui/material'

// ** Custom Imports
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

const PoductCurrenciesTab = ({ 
  productMasterValidation,
  monetariesGridValidation,
  monetariesInlineGridColumns,
  maxAccess
}) => {
  console.log(productMasterValidation.values);
            
  return (
    <>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <InlineEditGrid
          gridValidation={monetariesGridValidation}
          columns={monetariesInlineGridColumns}
          defaultRow={{
            
            productId: productMasterValidation.values
              ? productMasterValidation.values.recordId
                ? productMasterValidation.values.recordId
                : ''
              : '',
            countryId: '',
            countryRef: '',
            countryName: '',
            currencyId: '',
            currencyRef: '',
            currencyName: '',
            dispersalType: '',
            dispersalTypeName: '',
            isInactive: false
          }}
          width={900}
        />
      </Box>
    </>
  )
}


export default PoductCurrenciesTab
