import { Button } from '@mui/material'

function DataGridButton({ row, column, field, updateRow }) {
  return (
    <Button
      sx={{
        opacity: 1,
        '&:hover': { opacity: 0.7 },
        width: 15,
        height: 35,
        objectFit: 'contain'
      }}
      autoFocus
      onClick={e => column.onClick(e, row, updateRow)}
      variant='contained'
      disabled={!row[field]}
    >
      <img src='/images/buttonsIcons/popup.png' alt='popup' />
    </Button>
  )
}

export default {
  view: DataGridButton,
  edit: DataGridButton
}
