
// ** MUI Imports
import { Box } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

const PrerequisiteTab = ({ prerequisiteGridData, getPrerequisiteGridData, addPrerequisite, delPrerequisite,
   maxAccess, _labels }) => {


  const columns = [
    {
      field: 'code',
      headerName: _labels.code,
      flex: 1
    },
    {
      field: 'prerequisiteCode',
      headerName: _labels.prerequisite,
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
        <GridToolbar onAdd={addPrerequisite} maxAccess={maxAccess} />
        <Table
          columns={columns}
          gridData={prerequisiteGridData}
          rowId={['code']}
          api={getPrerequisiteGridData}
          onDelete={delPrerequisite}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
          height={300}
        />
      </Box>
    </>
  )
}

export default PrerequisiteTab
