import { Box } from '@mui/material'

// ** Custom Imports
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

const IDNumberTab = ({ bpMasterDataValidation, idNumberValidation, idNumberGridColumn, maxAccess }) => {

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
          scrollHeight={350}
          width={750}
          allowDelete={false}
        />
      </Box>
    </>
  )
}

export default IDNumberTab
