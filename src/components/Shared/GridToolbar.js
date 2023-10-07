// ** MUI Imports
import {
    Box,
    Button
} from '@mui/material'

const GridToolbar = ({
    onAdd,
}) => {

    return (
        <>
            {onAdd &&
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 2, pl: 2 }}>
                    <Button onClick={onAdd} variant='contained'>Add</Button>
                </Box>
            }
        </>
    );
};

export default GridToolbar;