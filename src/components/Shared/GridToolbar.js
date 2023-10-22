// ** MUI Imports
import {
    Box,
    Button
} from '@mui/material'

const GridToolbar = ({
    onAdd,
    openRPB
}) => {

    return (
        <Box sx={{ display: 'flex' }}>
            {onAdd &&
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
                    <Button onClick={onAdd} variant='contained'>Add</Button>
                </Box>
            }
            {openRPB &&
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
                    <Button onClick={openRPB} variant='contained'>OPEN RPB</Button>
                </Box>
            }
        </Box>
    );
};

export default GridToolbar;