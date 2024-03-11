import { Icon } from '@iconify/react'
import edit from './edit'
import { Button } from '@mui/material'

export default {
  view({value, name , row , column}) { // Added 'row' as a parameter

return (
      <Button
        sx={{ height: '30px' }}
        onClick={(e) => column.onClick(e, row)} // Corrected the usage of 'row'
        variant='contained'
      >
        {/* <Icon icon={editIcon} /> */}
        {/* {field} */}
      </Button>
    );
  },
  edit
};
