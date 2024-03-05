// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import Table from 'src/components/Shared/Table'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'


const ProductMasterWindow = ({
  onClose,
  onSave,
  rangeCommissionsInlineGridColumns,
  commissionsGridValidation,
  maxAccess
}) => {
  return (
    <Window id='ProductCommissionsWindow' Title='Commission' onClose={onClose} onSave={onSave} width={600} height={400} >
      <CustomTabPanel index={0} value={0}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          <Grid container gap={2}>
            <Grid xs={12}>
            <InlineEditGrid
              gridValidation={commissionsGridValidation}
              columns={rangeCommissionsInlineGridColumns}
              allowDelete={false}
              allowAddNewLine={false}/>
            </Grid>
          </Grid>
        </Box>
      </CustomTabPanel>
    </Window>
  )
}

export default ProductMasterWindow
