import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

const InlineEditGrid = ({
  row = { name: 'testName', reference: 'testRef' }
}) => {
  const [data, setData] = useState([{ rowId: 0, ...row }]);

  const handleCellEdit = (rowIndex, column, value) => {
    const updatedData = [...data];
    updatedData[rowIndex][column] = value;
    setData(updatedData);
  };

  const handleTabKey = (event, rowIndex, columnIndex) => {
    const rowLength = Object.keys(data[rowIndex]).length - 1;

    if (columnIndex === rowLength) {
      setData([...data, { rowId: data.length + 1, ...row }]);
      setTimeout(() => {
        document.getElementById(`cell-${rowIndex + 1}-1`).focus()
      }, 0);
    } else {
      const nextRowIndex = columnIndex + 1;
      document.getElementById(`cell-${rowIndex}-${nextRowIndex}`).focus();
    }
  };

  const handleDeleteRow = (rowIndex) => {
    if (data.length === 1)
      return

    const updatedData = [...data];
    updatedData.splice(rowIndex, 1);
    setData(updatedData);
  };

  const handleSubmit = () => {
    const dataWithoutRowId = data.map(({ rowId, ...rest }) => rest)
    console.log(data)
    console.log(dataWithoutRowId)
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Add header row above data rows */}
      {/* <Grid container item>
            {Object.keys(row).map((column) => (
              <Grid item key={column}>
                <TextField
                  size="small"
                  value={column}
                  disabled
                  sx={{
                    borderRadius: 0,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                    },
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                />
              </Grid>
            ))}
          </Grid> */}
      {data.map((row, rowIndex) => (
        <Grid container item key={row.rowId}>
          <Box display={'flex'}>
            <Grid container item>
              {Object.keys(row).map((column, columnIndex) =>
                columnIndex != 0 && (
                  <Grid item key={column}>
                    <TextField
                      label={rowIndex === 0 ? 'LABEL' : ''}
                      size='small'
                      id={`cell-${rowIndex}-${columnIndex}`}
                      value={data[rowIndex][column]}
                      onChange={(e) => handleCellEdit(rowIndex, column, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Tab') {
                          e.preventDefault();
                          handleTabKey(e, rowIndex, columnIndex);
                        }
                      }}
                      sx={{
                        minWidth: 120,
                        maxWidth: 200,
                        borderRadius: 0,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 0,
                        },
                      }}
                    />
                  </Grid>
                )
              )}
            </Grid>
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <IconButton
                onClick={() => handleDeleteRow(rowIndex)}
                size="small"
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>
        </Grid>
      ))}
    </Box>
  );
};

export default InlineEditGrid;
