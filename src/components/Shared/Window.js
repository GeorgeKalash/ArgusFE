import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { DialogTitle, DialogContent, Paper, Tabs, Tab, Box, Typography, IconButton } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import Draggable from 'react-draggable'
import WindowToolbar from './WindowToolbar'
import { useSettings } from 'src/@core/hooks/useSettings'
import { TrxType } from 'src/resources/AccessLevels'

const Window = React.memo(
  ({
    children,
    onClose,
    tabs,
    width = 800,
    height = 600,
    activeTab,
    setActiveTab,
    draggable = true,
    expandable = true,
    closable = true,
    Title,
    onSave,
    onClear,
    onInfo,
    controlled,
    editMode = false,
    disabledSubmit,
    disabledInfo,
    onApply,
    disabledApply,
    ...props
  }) => {
    const { settings } = useSettings()
    const { navCollapsed } = settings
    const [expanded, setExpanded] = useState(false)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const paperRef = useRef(null)
    const maxAccess = props.maxAccess?.record.maxAccess

    const windowToolbarVisible = useMemo(
      () => (editMode ? maxAccess >= TrxType.EDIT : maxAccess >= TrxType.ADD),
      [editMode, maxAccess]
    )
    const containerWidth = `calc(calc(100 * var(--vw)) - ${navCollapsed ? '10px' : '310px'})`
    const containerHeight = `calc(calc(100 * var(--vh)) - 40px)`
    const containerHeightPanel = `calc(calc(100 * var(--vh)) - 180px)`
    const heightPanel = height - 120
    useEffect(() => {
      const transactionLogInfo = document.querySelector('[data-unique-id]')
      if (transactionLogInfo) {
        transactionLogInfo.style.height = expanded ? '30vh' : '18vh'
      }
    }, [expanded])
    useEffect(() => {
      if (paperRef.current) {
        paperRef.current.focus()
      }
    }, [])

    const handleExpandToggle = useCallback(() => {
      if (!expanded) {
        setPosition({ x: 0, y: 0 })
      }
      setExpanded(prev => !prev)
    }, [expanded])

    const handleDrag = useCallback((e, ui) => {
      setPosition(prev => ({ x: prev.x + ui.deltaX, y: prev.y + ui.deltaY }))
    }, [])

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
          alignItems: 'center',
          pointerEvents: 'none'
        }}
      >
        <Draggable
          handle='#draggable-dialog-title'
          cancel={'[class*="MuiDialogContent-root"]'}
          bounds='parent'
          position={position}
          onDrag={handleDrag}
          onStart={() => draggable}
        >
          <Box sx={{ position: 'relative', pointerEvents: 'all' }}>
            <Paper
              ref={paperRef}
              tabIndex={-1}
              sx={{
                transition: 'width 0.3s, height 0.3s',
                height: controlled ? (expanded ? containerHeight : height) : expanded ? containerHeight : height,
                width: expanded ? containerWidth : width,
                display: controlled ? 'flex' : 'block',
                flexDirection: controlled ? 'column' : 'unset'
              }}
            >
              <DialogTitle
                id='draggable-dialog-title'
                sx={{
                  cursor: draggable ? 'move' : 'default',
                  pl: '15px !important',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: '0px !important',
                  margin: '0px !important',
                  backgroundColor: '#231F20',
                  borderTopLeftRadius: '5px',
                  borderTopRightRadius: '5px',
                  borderBottomLeftRadius: '0px',
                  borderBottomRightRadius: '0px',
                  height: '40px'
                }}
              >
                <Box>
                  <Typography sx={{ fontSize: '1.2rem', fontWeight: 600, color: 'white !important' }}>
                    {Title}
                  </Typography>
                </Box>
                <Box>
                  {expandable && (
                    <IconButton
                      tabIndex={-1}
                      edge='end'
                      onClick={handleExpandToggle}
                      data-is-expanded={expanded}
                      aria-label='expand'
                      sx={{ color: 'white !important' }}
                    >
                      <OpenInFullIcon />
                    </IconButton>
                  )}
                  {closable && (
                    <IconButton
                      tabIndex={-1}
                      edge='end'
                      sx={{ color: 'white !important' }}
                      onClick={onClose}
                      aria-label='clear input'
                    >
                      <ClearIcon />
                    </IconButton>
                  )}
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
                  })
                })
              )}
            </Paper>
          </Box>
        </Draggable>
      </Box>
    )
  }
)

export default Window
