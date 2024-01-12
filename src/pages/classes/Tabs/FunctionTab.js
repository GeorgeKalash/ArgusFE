
// ** MUI Imports
import { Box } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

const FunctionTab = ({ functionGridData, getFunctionGridData, addFunction, delFunction, editFunction,
   maxAccess, _labels }) => {


  const columns = [
    {
      field: 'functionId',
      headerName: _labels.function,
      flex: 1
    },
    {
      field: 'strategyId',
      headerName: _labels.strategy,
      flex: 1
    }
  ]

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }}
      >
        <GridToolbar onAdd={addFunction} maxAccess={maxAccess} />
        <Table
          columns={columns}
          gridData={functionGridData}
          rowId={['functionId']}
          api={getFunctionGridData}
          onDelete={delFunction}
          onEdit={editFunction}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
          height={300}
        />
      </Box>
    </>
  )
}

export default FunctionTab
