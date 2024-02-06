// ** Custom Imports
import CustomComboBox from 'src/components/Inputs/CustomComboBox'
import Table from 'src/components/Shared/Table'

// ** MUI Imports
import { Grid, Box, Button } from '@mui/material'
import { useEffect } from 'react'

const RowAccessTab = ({
  moduleStore,
  rowAccessValidation,
  handleCheckedRows,
  rowGridData,
  getRowAccessGridData,
  rowColumns,
  maxAccess,
  labels
}) => {
  useEffect(() => {
    ;(async function () {
      console.log('fireeee')

      //set row access combo to plant by default when opening the screen
      setTimeout(() => {
        rowAccessValidation.setFieldValue('classId', 20110)
      }, 0)
    })()
  }, [moduleStore, rowAccessValidation.values?.classId])

  return (
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Grid container spacing={2} alignItems='center'>
          <Grid item xs={6}>
            <CustomComboBox
              label={labels.rowAccess}
              valueField='key'
              displayField='value'
              store={moduleStore}
              name='classId'
              value={
                (Array.isArray(moduleStore) &&
                  moduleStore.filter(item => item.key === rowAccessValidation.values?.classId)[0]) ||
                moduleStore[0]
              } // Select the first value if there's no match
              maxAccess={maxAccess}
              onChange={(event, newValue) => {
                rowAccessValidation.setFieldValue('classId', newValue?.key)
                getRowAccessGridData(newValue?.key)
              }}
              error={rowAccessValidation.touched.classId && Boolean(rowAccessValidation.errors.classId)}
              helperText={rowAccessValidation.touched.classId && rowAccessValidation.errors.classId}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sx={{ pt: 2 }}>
        <Box>
          <Table
            columns={rowColumns}
            gridData={rowGridData}
            rowId={['recordId']}
            isLoading={false}
            maxAccess={maxAccess}
            pagination={false}
            height={300}
            handleCheckedRows={handleCheckedRows}
            checkTitle={labels.active}
            showCheckboxColumn={true}
            viewButtons={true}
          />
        </Box>
      </Grid>
    </Grid>
  )
}

export default RowAccessTab
