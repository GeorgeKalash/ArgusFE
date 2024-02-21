import { Box } from '@mui/material'

// ** Custom Imports
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

const IndicatorTab = ({
  strategyValidation,
  indicatorGridValidation,
  indicatorInlineGridColumns,
  maxAccess
}) => {
  return (
    <>
      <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', scroll: 'none', overflow:'hidden' }}>
        <InlineEditGrid
          gridValidation={indicatorGridValidation}
          columns={indicatorInlineGridColumns}
          defaultRow={{
            strategyId: strategyValidation.values
              ? strategyValidation.values.recordId
                ? strategyValidation.values.recordId
                : ''
              : '',
            codeId: '',
            seqNo: '',
            indicatorId: '',
            indicatorName:'',
            name: ''
          }}
          scrollHeight={280}
          width={550}
          allowDelete={false}
          allowAddNewLine={false}
        />
      </Box>
    </>
  )
}

export default IndicatorTab
