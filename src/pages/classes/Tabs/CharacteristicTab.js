
// ** MUI Imports
import { Box } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

const CharacteristicTab = ({ characteristicGridData, getCharacteristicGridData, addCharacteristic, delCharacteristic,
   maxAccess, _labels }) => {


  const columns = [
    {
      field: 'chName',
      headerName: _labels.characteristic,
      flex: 1
    },
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
        <GridToolbar onAdd={addCharacteristic} maxAccess={maxAccess} />
        <Table
          columns={columns}
          gridData={characteristicGridData}
          rowId={['chId']}
          api={getCharacteristicGridData}
          onDelete={delCharacteristic}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
          height={300}
        />
      </Box>
    </>
  )
}

export default CharacteristicTab
