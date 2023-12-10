// ** MUI Imports
import { DialogTitle, DialogContent, Paper, Tabs, Tab, Box, Typography, IconButton } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'

// ** 3rd Party Imports
import Draggable from 'react-draggable'

// ** Custom Imports
import WindowToolbar from './WindowToolbar'

import { useSettings } from 'src/@core/hooks/useSettings'

// ** Resources
import { TrxType } from 'src/resources/AccessLevels'

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
  onClear,
  editMode = false,
  ...props
}) => {
  const { settings } = useSettings()
  const { navCollapsed } = settings

  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess

  const windowToolbarVisible = editMode
    ? maxAccess < TrxType.EDIT
      ? false
      : true
    : maxAccess < TrxType.ADD
    ? false
    : true

  const handleKeyDown = event => {
    if (event.key === 'Enter') {
      onSave()
    }
  }

  const containerWidth = `calc(100vw - ${navCollapsed ? '68px' : '300px'})`
  const containerHeight = `calc(100vh - 88px)`

  return (
    <Box
      id='parent'
      sx={{
        bottom: 0,
        position: 'absolute',
        width: containerWidth,
        height: containerHeight,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Draggable handle='#draggable-dialog-title' cancel={'[class*="MuiDialogContent-root"]'} bounds='parent'>
        <Box sx={{ position: 'relative' }}>
          <Paper
            onKeyDown={handleKeyDown}
            sx={{
              width: width,
              minHeight: height
            }}
          >
            <DialogTitle
              id='draggable-dialog-title'
              sx={{
                cursor: 'move',
                py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Box>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 600 }}>{Title}</Typography>
              </Box>
              <Box>
                <IconButton tabIndex={-1} edge='end' onClick={onClose} aria-label='clear input'>
                  <ClearIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            {tabs && (
              <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(newValue)}>
                {tabs.map((tab, i) => (
                  <Tab key={i} label={tab.label} disabled={tab?.disabled} />
                ))}
              </Tabs>
            )}
            <DialogContent sx={{ height: height, p: 0 }}>{children}</DialogContent>
            {windowToolbarVisible && <WindowToolbar onSave={onSave} onClear={onClear} />}
          </Paper>
        </Box>
      </Draggable>
    </Box>
  )
}

export default Window
