
// ** MUI Imports
import {Box} from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

const SecurityGrpTab = ({ securityGrpGridData, getSecurityGrpGridData, addSecurityGrp, delSecurityGrp, popupSecurityGrp, labels, maxAccess }) => {

  const columns = [
    {
      field: 'sgName',
      headerName: labels.group,
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
        <GridToolbar onAdd={addSecurityGrp} maxAccess={maxAccess} />
        <Table
          columns={columns}
          gridData={securityGrpGridData}
          rowId={['sgId']}
          api={getSecurityGrpGridData}
          onEdit={popupSecurityGrp}
          onDelete={delSecurityGrp}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
          height={300}
        />
      </Box>
    </>
  )
}

export default SecurityGrpTab
