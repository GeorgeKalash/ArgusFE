// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import { DialogTitle, DialogContent, Paper, Tabs, Tab, Box, Typography, IconButton } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'

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
  onInfo,
  controlled,
  editMode = false,
  disabledSubmit,
  disabledInfo,
  ...props
}) => {
  const { settings } = useSettings()
  const { navCollapsed } = settings

  const [expanded, setExpanded] = useState(false)

  const maxAccess = props.maxAccess && props.maxAccess.record.maxAccess

  const windowToolbarVisible = editMode
    ? maxAccess < TrxType.EDIT
      ? false
      : true
    : maxAccess < TrxType.ADD
    ? false
    : true

  // const handleKeyDown = event => {
  //   if (event.key === 'Enter') {
  //     onSave()
  //   }
  // }

  const containerWidth = `calc(100vw - ${navCollapsed ? '68px' : '300px'})`
  const containerHeight = `calc(100vh - 48px)`

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
      <Draggable
        handle='#draggable-dialog-title'
        cancel={'[class*="MuiDialogContent-root"]'}
        bounds='parent'
        sx={{
          width: expanded && '100%',
          minHeight: expanded && '100%',
          backgroundColor: 'red'
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Paper
                 sx={{
                  ...(controlled
                    ? {
                         height: expanded ? containerHeight : height // Expand height to 100% when expanded
                      }
                    : {
                        minHeight: expanded ? containerHeight : height // Expand height to 100% when expanded
                      }),
                  width: expanded ? containerWidth : width // Expand width to 100% when expanded
                  // ... (other styles)
                }}
                style={
                  controlled
                    ? {
                        display: 'flex',
                        flexDirection: 'column',
                      }
                    : {}
                }
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
                <IconButton tabIndex={-1} edge='end' onClick={() => setExpanded(!expanded)} aria-label='expand'>
                  <OpenInFullIcon /> {/* Add the icon for expanding */}
                </IconButton>
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
            {!controlled ? (
              <>
                <DialogContent sx={{ height: expanded ? `calc(100vh - 48px - 180px)` : height, p: 0 }}>
                  {children}
                </DialogContent>
                {windowToolbarVisible && (
                  <WindowToolbar
                    onSave={onSave}
                    onClear={onClear}
                    onInfo={onInfo}
                    disabledSubmit={disabledSubmit}
                    disabledInfo={disabledInfo}
                  />
                )}
              </>
            ) : (
              children
            )}
          </Paper>
        </Box>
      </Draggable>
    </Box>
  )
}

export default Window
