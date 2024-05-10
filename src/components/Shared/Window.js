// ** React Imports
import React, { useEffect, useState } from 'react'

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
  height = 600,
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
  canExpand = true,
  onApply,
  disabledApply,
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

  const containerWidth = `calc(calc(100 * var(--vw)) - ${navCollapsed ? '10px' : '310px'})`
  const containerHeight = `calc(calc(100 * var(--vh)) - 83px)`
  const containerHeightPanel = `calc(calc(100 * var(--vh)) - 180px)`
  const heightPanel = height - 120

  useEffect(() => {
    const transactionLogInfo = document.querySelector('[data-unique-id]')

    if (transactionLogInfo) {
      transactionLogInfo.style.height = expanded ? '30vh' : '18vh'
    }
  }, [expanded])

  return (
    <Box
      id='parent'
      sx={{
        bottom: 42,
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
                    flexDirection: 'column'
                  }
                : {}
            }
          >
            <DialogTitle
              id='draggable-dialog-title'
              sx={{
                cursor: 'move',
                pl: '15px !important',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: '0px !important', 
                margin: '0px !important', 
                backgroundColor: '#231f20',
                borderTopLeftRadius: '5px',
                borderTopRightRadius: '5px',
                borderBottomLeftRadius: '0px',
                borderBottomRightRadius: '0px'
              }}
            >
              <Box>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 600,color:'white !important' }}>{Title}</Typography>
              </Box>
              <Box>
                {canExpand && (
                  <IconButton
                    tabIndex={-1}
                    edge='end'
                    onClick={() => setExpanded(!expanded)}
                    data-is-expanded={expanded}
                    aria-label='expand'
                    sx={{ color:'white !important'}}
                  >
                    <OpenInFullIcon /> {/* Add the icon for expanding */}
                  </IconButton>
                )}
                <IconButton tabIndex={-1} edge='end' sx={{ color:'white !important'}} onClick={onClose} aria-label='clear input'>
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
                <DialogContent sx={{ p: 2 }}>{children}</DialogContent>
                {windowToolbarVisible && (
                  <WindowToolbar
                    onSave={onSave}
                    onClear={onClear}
                    onInfo={onInfo}
                    onApply={onApply}
                    disabledSubmit={disabledSubmit}
                    disabledInfo={disabledInfo}
                    disabledApply={disabledApply}
                  />
                )}
              </>
            ) : (
              React.Children.map(children, child => {
                return React.cloneElement(child, {
                  expanded: expanded,
                  height: expanded ? containerHeightPanel : heightPanel
                }) // Pass containerHeight as prop to children
              })
            )}
          </Paper>
        </Box>
      </Draggable>
    </Box>
  )
}

export default Window
