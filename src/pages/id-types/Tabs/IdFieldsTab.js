import { Box } from '@mui/material'

// ** Custom Imports
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

const IdFieldsTab = ({ idTypesValidation, idFieldsValidation, idFieldsGridColumn, maxAccess, idtId }) => {
  return (
    <>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <InlineEditGrid
          gridValidation={idFieldsValidation}
          maxAccess={maxAccess}
          columns={idFieldsGridColumn}
          defaultRow={{
            idtId: idTypesValidation.values
              ? idTypesValidation.values.recordId
                ? idTypesValidation.values.recordId
                : ''
              : '',
            controlId: '',
            accessLevel: '',
            accessLevelName: ''
          }}
          scrollHeight={320}
          width={550}
        />
      </Box>
    </>
  )
}

export default IdFieldsTab
