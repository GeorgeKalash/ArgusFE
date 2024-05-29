import { Button } from '@mui/material'
import { useGridApiRef } from '@mui/x-data-grid'

function DataGridButton({ row, column, field, update, updateRow, handleButtonClick }) {
  const apiRef = useGridApiRef()

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
      onClick={e => {
        handleButtonClick(row.id, field), column.onClick(e, row, update, updateRow)
      }}
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
