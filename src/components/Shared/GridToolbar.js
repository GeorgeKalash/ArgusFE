// ** MUI Imports
import {
    Box,
    Button,
} from '@mui/material'

const GridToolbar = ({
    onAdd,
    openRPB,
    ...props
}) => {

    const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess
    const addBtnVisible = onAdd && maxAccess != 1

    return (
        <Box sx={{ display: 'flex', pb: 2 }}>
            {addBtnVisible &&
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