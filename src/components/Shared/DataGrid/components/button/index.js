import edit from './edit'
import { Button } from '@mui/material'

export default {
  view({ row , column, field}) {
  console.log(column , row , field)

return (
      <Button

        // sx={{ p:1 }}
        autoFocus
        onClick={(e) => column.onClick(e, row)}
        variant='contained'
        disabled={!row[field]}
      >
         {/* {column?.label} */}
         <img src='/images/buttonsIcons/popup.png' alt='popup' />
      </Button>
    );
  },
  edit
};
