import React, { useState } from 'react'
import TextField from '@mui/material/TextField'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import { Autocomplete, InputAdornment } from '@mui/material'

const InlineEditGrid = ({
  columns = [
    { key: 0, header: 'Reference', name: 'reference', value: '' },
    { key: 0, header: 'Name', name: 'dispersalTypeId', value: '' },
    { key: 1, header: 'Disp. Type', name: 'dispersalTypeId', value: null },
    { key: 2, header: 'Is Default', name: 'isDefault ', value: false },
    { key: 2, header: 'Is Inactive', name: 'isInactive', value: false },
  ]
}) => {
  const [data, setData] = useState([{ rowId: 0, columns }])

  const dispersalTypeStore = [
    { key: 1, value: 'bank' },
    { key: 2, value: 'cash' },
    { key: 3, value: 'wallet' },
    { key: 4, value: 'delivery' },
  ]

  const handleCellEdit = (rowIndex, columnIndex, value) => {
    const updatedData = [...data]
    updatedData[rowIndex].columns[columnIndex].value = value
    setData(updatedData)
  }

  const handleTabKey = (event, rowIndex, columnIndex) => {
    const rowLength = data[rowIndex].columns.length - 1

    if (columnIndex === rowLength) {
      setData([...data, { rowId: data.length + 1, columns }])
      setTimeout(() => {
        document.getElementById(`cell-${rowIndex + 1}-0`).focus()
      }, 0)
    } else {
      const nextRowIndex = columnIndex + 1
      document.getElementById(`cell-${rowIndex}-${nextRowIndex}`).focus()
    }
  }

  const handleDeleteRow = (rowIndex) => {
    if (data.length === 1) {
      setData([{ rowId: 0, columns }])
    }
    else {
      const updatedData = [...data]
      updatedData.splice(rowIndex, 1)
      setData(updatedData)
    }
  }

  const handleSubmit = () => { //NOT READY
    const dataWithoutRowId = data.map(({ rowId, ...rest }) => rest)
  }

  return (
    <Box sx={{ p: 4 }}>
      {data.map((row, rowIndex) => {

        return (
          <Grid container item key={row.rowId}>
            <Box display={'flex'}>
              <Grid container item>
                {row.columns.map((column, columnIndex) => {
                  switch (column.key) {
                    case 0:
                      return (
                        <TextField
                          name={column.name}
                          label={rowIndex === 0 ? column.header : ''}
                          placeholder={rowIndex != 0 ? column.header : ''}
                          size='small'
                          id={`cell-${rowIndex}-${columnIndex}`}
                          value={column.value}
                          onChange={(e) => handleCellEdit(rowIndex, columnIndex, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault()
                              handleTabKey(e, rowIndex, columnIndex)
                            }
                          }}
                          sx={{
                            minWidth: 120,
                            maxWidth: 150,
                            borderRadius: 0,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 0,
                            },
                          }}
                        />
                      )

                    case 1:
                      return (
                        <Autocomplete
                          id={`cell-${rowIndex}-${columnIndex}`}
                          options={dispersalTypeStore}
                          getOptionLabel={(option) => option.value}
                          value={dispersalTypeStore.find((item) => item.key === column.value)}
                          onChange={(event, newValue) => handleCellEdit(rowIndex, columnIndex, newValue?.key)}
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault();
                              handleTabKey(e, rowIndex, columnIndex);
                            }
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              name={column.name}
                              label={rowIndex === 0 ? column.header : ''}
                              size='small'
                              placeholder={rowIndex !== 0 ? column.header : ''}
                              sx={{
                                minWidth: 140,
                                maxWidth: 170,
                                borderRadius: 0,
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 0,
                                },
                              }}
                            />
                          )}
                        />
                      )

                    case 2:
                      return (
                        <TextField
                          fullWidth
                          value={column.header}
                          size='small'
                          id={`cell-${rowIndex}-${columnIndex}`}
                          onChange={(e) => handleCellEdit(rowIndex, columnIndex, e.target.value)}
                          sx={{
                            minWidth: 120,
                            maxWidth: 170,
                            borderRadius: 0,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 0,
                            },
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Tab') {
                              e.preventDefault()
                              handleTabKey(e, rowIndex, columnIndex)
                            }
                          }}
                          inputProps={{
                            readOnly: true,
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      name={column.name}
                                      checked={column.value}
                                      onChange={(e) => handleCellEdit(rowIndex, columnIndex, e.target.checked)}
                                    />
                                  }
                                />
                              </InputAdornment>
                            ),
                          }}
                        />
                      )

                    default:
                      return null
                  }
                })}
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
        )
      })}
    </Box>
  )
}

export default InlineEditGrid