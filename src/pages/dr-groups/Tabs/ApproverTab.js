
// ** MUI Imports
import { Box } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

const ApproverTab = ({ approverGridData, getApproverGridData, addApprover, delApprover, editApprover, maxAccess, _labels }) => {


  const columns = [
    {
      field: 'codeRef',
      headerName: _labels.reference,
      flex: 1
    },
    {
      field: 'codeName',
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
        <GridToolbar onAdd={addApprover} maxAccess={maxAccess} />
        <Table
          columns={columns}
          gridData={approverGridData}
          rowId={['codeId']}
          api={getApproverGridData}
          onEdit={editApprover}
          onDelete={delApprover}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
          height={300}
        />
      </Box>
    </>
  )
}

export default ApproverTab
