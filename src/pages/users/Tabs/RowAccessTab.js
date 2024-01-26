// ** Custom Imports
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import Table from 'src/components/Shared/Table'

// ** MUI Imports
import {Grid,Box} from '@mui/material'

const RowAccessTab = ({
    moduleStore,
    rowAccessValidation,
    handleRowAccessSubmit,
    getRowAccessGridData,
    rowColumns,
    maxAccess,
    labels
}) => {
  return (
    <Grid container spacing={4}>
        <Grid item xs={12}>
          <CustomComboBox
            label={labels.rowAccess}
            valueField='key'
            displayField='value'
            store={moduleStore}
            name='classId'
            value={moduleStore.filter(item => item.key === rowAccessValidation.values?.classId)[0]}
            maxAccess={maxAccess}
            onChange={(event, newValue) => {
                  rowAccessValidation.setFieldValue('classId', newValue?.key)
            }}
            error={rowAccessValidation.touched.classId && Boolean(rowAccessValidation.errors.classId)}
            helperText={rowAccessValidation.touched.classId && rowAccessValidation.errors.classId}
          />
        </Grid>
<Grid xs={12} sx={{pt:2}}>
  <Box>
  <Table
          columns={rowColumns}
          gridData={getRowAccessGridData}
          rowId={['plantId']}
          api={getRowAccessGridData}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
          height={300}
        />
  </Box>

</Grid>
    </Grid>
  )
}

export default RowAccessTab
