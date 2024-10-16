import React from 'react'
import CustomNumberField from 'src/components/Inputs/CustomNumberField'
import IconButton from '@mui/material/IconButton'
import Box from '@mui/material/Box'

export default function NumberfieldEdit({ column: { props }, id, field, value, update }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
      <CustomNumberField
        value={value}
        label={''}
        readOnly={props?.readOnly}
        decimalScale={props?.decimalScale}
        autoFocus
        hasBorder={false}
        onChange={e => {
          update({
            id,
            field,
            value: e.target.value ? Number(e.target.value) : ''
          })
        }}
        onClear={() =>
          update({
            id,
            field,
            value: ''
          })
        }
        {...props}
        sx={{
          flexGrow: 1,
          border: 'none', // Ensures no border on the field
          '& .MuiOutlinedInput-root': {
            borderRadius: 0, // Removes the rounded corners
            '& fieldset': {
              border: 'none' // Ensures the input field itself doesn't have a border
            }
          }
        }}
      />

      <IconButton
        tabIndex={-1}
        aria-label='switch icon'
        onClick={() => {}}
        sx={{
          padding: '7px',
          height: '100%',
          '&:hover': {
            backgroundColor: '#607D8B'
          }
        }}
      >
        <img src='/images/buttonsIcons/switch-arrow-icon.png' alt='switch' style={{ width: '24px', height: '24px' }} />
      </IconButton>
    </Box>
  )
}
