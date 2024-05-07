// ** MUI Imports
import { Box } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { VertLayout } from 'src/components/Shared/Layouts/VertLayout'
import { Fixed } from 'src/components/Shared/Layouts/Fixed'
import { Grow } from 'src/components/Shared/Layouts/Grow'

const SecurityGrpTab = ({
  securityGrpGridData,
  getSecurityGrpGridData,
  addSecurityGrp,
  delSecurityGrp,
  popupSecurityGrp,
  labels,
  maxAccess
}) => {
  const columns = [
    {
      field: 'sgName',
      headerName: labels.group,
      flex: 1
    }
  ]

  return (
    <VertLayout>
    <Fixed>
    <GridToolbar onAdd={addSecurityGrp} maxAccess={maxAccess} />
    </Fixed>
    <Grow>
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
      />
    </Grow>
  </VertLayout>
    
  )
}

export default SecurityGrpTab
