import { Grid, Box } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import CustomTextField from 'src/components/Inputs/CustomTextField'
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import InlineEditGrid from 'src/components/Shared/InlineEditGrid'

const ProductAgentTab = ({
  onDispersalSelection,
  dispersalsGridData,
  agentsHeaderValidation,
  agentsGridValidation,
  agentsInlineGridColumns,
  maxAccess
}) => {
return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <Grid container gap={2}>
          <Grid container xs={12} spacing={2}>
            <Grid item xs={6}>
              <CustomComboBox
                name='dispersalId'
                label='Dispersal'
                valueField='recordId'
                displayField='reference'
                store={dispersalsGridData}
                value={dispersalsGridData?.filter(item => item.key === agentsHeaderValidation.values.dispersalId)[0]}
                required
                onChange={(event, newValue) => {
                  console.log(newValue?.recordId);
                  agentsHeaderValidation.setFieldValue('dispersalId', newValue?.recordId)
                  onDispersalSelection(newValue?.recordId);
                  console.log(agentsHeaderValidation);
                }}
                error={Boolean(agentsHeaderValidation.errors.dispersalId)}
                helperText={agentsHeaderValidation.errors.dispersalId}
              />
            </Grid>
          </Grid>
          <Grid xs={12}>
            <InlineEditGrid
              gridValidation={agentsHeaderValidation.values.dispersalId && agentsGridValidation}
              columns={agentsInlineGridColumns}
              defaultRow={{
                dispersalId: agentsHeaderValidation.values
                  ? agentsHeaderValidation.values.dispersalId
                    ? agentsHeaderValidation.values.dispersalId
                    : ''
                  : '',
                agentId:'',
                agentName:''
              }}
              width={900}
              height={200}
            />
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default ProductAgentTab
