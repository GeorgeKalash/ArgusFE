import edit from './edit'
import { Button } from '@mui/material'

export default {
  view({ row , column, field}) {
  console.log(column , row , field)

return (
      <Button
        sx={{ height: '30px' }}
        autoFocus
        onClick={(e) => column.onClick(e, row)}
        variant='contained'
        disabled={!row[field]}
      >
         {column?.label}
      </Button>
    );
  },
  edit
};
