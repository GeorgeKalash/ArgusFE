// ** MUI Imports
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Paper,
    Tabs,
    Tab,
    Box,
    Typography,
    IconButton,
    Button
} from '@mui/material'
import { ClickAwayListener } from '@mui/base';
import ClearIcon from '@mui/icons-material/Clear'

// ** 3rd Party Imports
import Draggable from 'react-draggable';

function PaperComponent(props) {
    return (
        <Draggable
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
        >
            <Paper {...props} />
        </Draggable>
    );
}


const Window = ({
    children,
    onClose,
    tabs,
    width = 800,
    height = 400,
    activeTab,
    setActiveTab,
    Title,
    onSave,
}) => {

    return (
        <Draggable
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
        >
            <Paper sx={{ width: width, minHeight: height, position: 'absolute', top: `calc(70vh - ${height}px)`, left: `calc(70vw - ${width}px)` }}>
                <DialogTitle sx={{ cursor: 'move', py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} id="draggable-dialog-title">
                    <Box>
                        <Typography sx={{ fontSize: '1.2rem', fontWeight: 600 }}>
                            {Title}
                        </Typography>
                    </Box>
                    <Box>
                        <IconButton
                            tabIndex={-1}
                            edge='end'
                            onClick={onClose}
                            aria-label='clear input'
                        >
                            <ClearIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>
                {tabs &&
                    <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(newValue)}>
                        {tabs.map((tab, i) => (
                            <Tab
                                key={i}
                                label={tab.label}
                            />
                        ))}
                    </Tabs>
                }
                <DialogContent sx={{ height: height, p: 0 }}>
                    {children}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onSave} variant='contained'>Submit</Button>
                </DialogActions>

            </Paper>
        </Draggable>
    );
};

export default Window;