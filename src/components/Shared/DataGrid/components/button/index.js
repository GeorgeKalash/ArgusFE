import edit from './edit'
import { Button } from '@mui/material'

export default {
  view({ row , column, field}) {

return (
      <Button
      sx={{
        opacity: 1,  '&:hover': { opacity: 0.7 },
        width: 15,
        height: 35,
        objectFit: 'contain'
      }}
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
