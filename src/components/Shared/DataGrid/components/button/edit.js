import { useGridApiContext } from '@mui/x-data-grid'
import { Button } from '@mui/material'

export default function TextFieldEdit({ column, row, field }) {


  return (
    <Button
        sx={{ height: '30px' }}
        auto
        onClick={(e) => column.onClick(e, row)} // Corrected the usage of 'row'
        variant='contained'
        disabled={!row[field]}
      >
         {column?.label}
      </Button>


  )
}
