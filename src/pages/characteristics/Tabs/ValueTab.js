
// ** MUI Imports
import { Box } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

const ValueTab = ({ valueGridData, getValueGridData, addValue, delValue, editValue, maxAccess, _labels }) => {


  const columns = [
    {
      field: 'value',
      headerName: _labels.value,
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
        <GridToolbar onAdd={addValue} maxAccess={maxAccess} />
        <Table
          columns={columns}
          gridData={valueGridData}
          rowId={['recordId']}
          api={getValueGridData}
          onEdit={editValue}
          onDelete={delValue}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
          height={300}
        />
      </Box>
    </>
  )
}

export default ValueTab
