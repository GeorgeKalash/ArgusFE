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
    Button,
} from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import { makeStyles } from '@material-ui/core/styles'

// ** 3rd Party Imports
import Draggable from 'react-draggable'

// ** Custom Imports
import WindowToolbar from './WindowToolbar'

function PaperComponent(props) {
    return (
        <Draggable
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
        >
            <Paper {...props} />
        </Draggable>
    )
}



const OldWindow = ({ children, open, onClose, tabs, height = 400,
    activeTab,
    setActiveTab,
    Title,
    onSave
}) => {

    const useStyles = makeStyles((theme) => ({
        customBackdrop: {
            left: 300,
            top: 136,
            pointerEvents: 'all',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
        },
    }))

    const classes = useStyles();


    const handleClose = (event, reason) => {
        if (reason && reason == "backdropClick")
            return;
        onClose()
    }

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth='sm'
            PaperComponent={PaperComponent}
            onKeyUp={(e) => {
                const ENTER = 13

                if (e.keyCode === ENTER) {
                    onSave()
                }
            }}
            sx={{ left: 300, top: 136, pointerEvents: 'all', }}
            BackdropProps={{
                classes: {
                    root: classes.customBackdrop,
                },
            }}
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
            <WindowToolbar onSave={onSave} />
        </Dialog>
    )
}

export default OldWindow