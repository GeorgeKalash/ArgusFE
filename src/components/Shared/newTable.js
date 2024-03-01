import React from 'react';
import { DataGrid } from '@mui/x-data-grid';

const newTable = ({ summaryData }) => {
  // Define the columns for your summary table
  const columns = [
    { field: 'id', headerName: 'Currency', width: 150 },
    { field: 'debit', headerName: 'Debit', width: 150 },
    { field: 'credit', headerName: 'Credit', width: 150 },
    { field: 'balance', headerName: 'Balance', width: 150 },
  ];

  return (
    <div style={{ height: 250, width: '100%' }}>
      <DataGrid
        rows={summaryData}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        checkboxSelection={false}
        disableSelectionOnClick
      />
    </div>
  );
};

export default newTable;