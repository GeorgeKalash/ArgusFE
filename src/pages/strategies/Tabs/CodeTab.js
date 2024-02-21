
// ** MUI Imports
import { Box } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

const CodeTab = ({ codeGridData, getCodeGridData, addCode, delCode,
   maxAccess, _labels }) => {


  const columns = [
    {
      field: 'code',
      headerName: _labels.code,
      flex: 1
    },
    {
      field: 'name',
      headerName: _labels.name,
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
        <GridToolbar onAdd={addCode} maxAccess={maxAccess} />
        <Table
          columns={columns}
          gridData={codeGridData}
          rowId={['codeId']}
          api={getCodeGridData}
          onDelete={delCode}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
          height={300}
        />
      </Box>
    </>
  )
}

export default CodeTab
