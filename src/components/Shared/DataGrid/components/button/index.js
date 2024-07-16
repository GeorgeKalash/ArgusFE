import { Button } from '@mui/material'
import { useGridApiRef } from '@mui/x-data-grid'

function DataGridButton({ row, column, field, update, updateRow }) {
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
        column.onClick(e, row, update, updateRow)
      }}
      variant={!!column.img ? '' :'contained'}
      disabled={!row[field]}
    >
      {
       !!column.img ? 
        <img src='/images/buttonsIcons/costCenter.png' alt='popup' /> 
        : <img src='/images/buttonsIcons/popup.png' alt='popup' />
      }
    </Button>
  )
}

export default {
  view: DataGridButton,
  edit: DataGridButton
}
