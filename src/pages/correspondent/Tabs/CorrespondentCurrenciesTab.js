import { Box } from '@mui/material'

// ** Custom Imports
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

const CorrespondentCurrenciesTab = ({
  correspondentValidation,
  currenciesGridValidation,
  currenciesInlineGridColumns,
  corId,
  maxAccess,
  editMode
}) => {
  return (
    <>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <InlineEditGrid
          gridValidation={currenciesGridValidation}
          columns={currenciesInlineGridColumns}
          defaultRow={{
            corId: correspondentValidation.values
              ? correspondentValidation.values.recordId
                ? correspondentValidation.values.recordId
                : ''
              : '',
            currencyId: '',
            currencyRef: '',

            //currencyName: '',
            glCurrencyId: '',
            glCurrencyRef: '',

            //glCurrencyName: '',

            exchangeId: '',
            exchangeRef: '',
            outward: false,
            inward: false,
            bankDeposit: false,
            deal: false,
            isInactive: false
          }}
          width={1000}
          allowDelete={!editMode}
          allowAddNewLine={!editMode}
          onDelete={() => console.log('before delete')}
        />
      </Box>
    </>
  )
}

export default CorrespondentCurrenciesTab
