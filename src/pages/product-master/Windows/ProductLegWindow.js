// ** MUI Imports
import { Grid, Box, FormControlLabel, Checkbox } from '@mui/material'

// ** Custom Imports
import Window from 'src/components/Shared/Window'
import CustomTabPanel from 'src/components/Shared/CustomTabPanel'
import Table from 'src/components/Shared/Table'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'

const ProductMasterWindow = ({
  onClose,
  tabs,
  activeTab,
  setActiveTab,
  onSave,
  productLegWindowOpen,
  commissionColumns,
  productLegCommissionGridData,
  productFieldGridData,
  productAgentGridData
}) => {
  return (
    <Window id='ProductCommissionsWindow' Title='Product Commission' onClose={onClose} width={500} height={400}>
      <CustomTabPanel index={0} value={0}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          <Grid container>
            {/* First Column */}
            <Grid container rowGap={2} xs={6} sx={{ px: 2 }}>
              <Grid item xs={12}>
                <CustomTextField label='Reference' value={'reference 1'} readOnly={true} />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField name='plantName' label='Plant' readOnly={true} />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField name='dispersal' label='Dispersal' readOnly={true} />
              </Grid>
            </Grid>
            {/* Second Column */}
            <Grid ccontainer rowGap={2} xs={6} sx={{ px: 2 }}>
              <Grid item xs={12}>
                <CustomTextField label='Name' value={'name 1'} readOnly={true} />
              </Grid>
              <Grid item xs={12}>
                <CustomTextField name='currencyName' label='Currency' readOnly={true} />
              </Grid>
            </Grid>
          </Grid>
          <Table
            columns={commissionColumns}
            gridData={productLegCommissionGridData}
            rowId={['commissionId']}
            isLoading={false}
            pagination={false}
            height={200}
          />
        </Box>
      </CustomTabPanel>
    </Window>
  )
}

export default ProductMasterWindow
