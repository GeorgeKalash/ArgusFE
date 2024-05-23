import { Button } from '@mui/material'

export default function TextFieldEdit({ column, row, field, update }) {
  return (
    <Button
      auto
      onClick={e => column.onClick(e, row, update)} // Corrected the usage of 'row'
      variant='contained'
      disabled={!row[field]}
      sx={{
        opacity: 1,
        '&:hover': { opacity: 0.7 },
        width: 15,
        height: 35,
        objectFit: 'contain'
      }}
    >
      {/* {column?.label} */}
      <img src='/images/buttonsIcons/popup.png' alt='popup' />
    </Button>
  )
}
