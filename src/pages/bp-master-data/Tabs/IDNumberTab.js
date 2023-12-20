import { Box } from '@mui/material'

// ** Custom Imports
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

const IDNumberTab = ({ bpMasterDataValidation, idNumberValidation, idNumberGridColumn, idNumberStore, maxAccess }) => {
  return (
    <>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <InlineEditGrid
          gridValidation={idNumberValidation}
          maxAccess={maxAccess}
          columns={idNumberGridColumn}
          defaultRow={{
            bpId: bpMasterDataValidation.values
              ? bpMasterDataValidation.values.recordId
                ? bpMasterDataValidation.values.recordId
                : ''
              : '',
            incId: '',
            incName: '',
            idNum: ''
          }}
          scrollHeight={320}
          width={550}
        />
      </Box>
    </>
  )
}

export default IDNumberTab
