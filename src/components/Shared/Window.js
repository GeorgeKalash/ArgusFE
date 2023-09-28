// ** MUI Imports
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Paper,
    Tabs,
    Tab,
    Box,
    Typography,
    IconButton,
} from '@mui/material'
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


const Window = ({ children, open, onClose, tabs, height = 400,
    activeTab,
    setActiveTab,
    Title
}) => {

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth={true}
            maxWidth='sm'
            PaperComponent={PaperComponent}
        >
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
            <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(newValue)}>
                {tabs.map((tab, i) => (
                    <Tab
                        key={i}
                        label={tab.label}
                    />
                ))}
            </Tabs>
            <DialogContent sx={{ height: height, p: 0 }}>
                {children}
            </DialogContent>
        </Dialog>
    );
};

export default Window;