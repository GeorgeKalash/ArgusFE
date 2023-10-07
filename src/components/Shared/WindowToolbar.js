// ** MUI Imports
import {
    DialogActions,
    Button
} from '@mui/material'

const WindowToolbar = ({
    onSave,
}) => {

    return (
        <>
            {onSave &&
                <DialogActions>
                    <Button onClick={onSave} variant='contained'>Submit</Button>
                </DialogActions>
            }
        </>
    );
};

export default WindowToolbar;