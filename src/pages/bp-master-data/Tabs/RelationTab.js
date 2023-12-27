// ** React Imports
import { useEffect, useState, useContext } from 'react'

// ** MUI Imports
import { Grid, Box, Checkbox } from '@mui/material'

// ** Custom Imports
import Table from 'src/components/Shared/Table'
import GridToolbar from 'src/components/Shared/GridToolbar'

const RelationTab = ({ relationGridData, getRelationGridData, addRelation, delRelation, popupRelation, labels, maxAccess }) => {


  const columns = [
    {
      field: 'relationName',
      headerName: labels.relation,
      flex: 1
    },
    {
      field: 'toBPName',
      headerName: labels.businessPartner,
      flex: 1
    },
    {
      field: 'startDate',
      headerName: labels.from,
      flex: 1
    },
    {
      field: 'endDate',
      headerName: labels.to,
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
        <GridToolbar onAdd={addRelation} maxAccess={maxAccess} />
        <Table
          columns={columns}
          gridData={relationGridData}
          rowId={['recordId']}
          api={getRelationGridData}
          onEdit={popupRelation}
          onDelete={delRelation}
          isLoading={false}
          maxAccess={maxAccess}
          pagination={false}
          height={200}
        />
      </Box>
    </>
  )
}

export default RelationTab
