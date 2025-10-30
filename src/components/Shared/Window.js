import React, { useEffect, useState, useCallback, useMemo, useRef, useContext } from 'react'
import { DialogTitle, DialogContent, Paper, Tabs, Tab, Box, Typography, IconButton } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import MinimizeIcon from '@mui/icons-material/Minimize'
import RefreshIcon from '@mui/icons-material/Refresh'
import Draggable from 'react-draggable'
import WindowToolbar from './WindowToolbar'
import { useSettings } from 'src/@core/hooks/useSettings'
import { TrxType } from 'src/resources/AccessLevels'
import { CacheDataProvider } from 'src/providers/CacheDataContext.js'
import { RequestsContext } from 'src/providers/RequestsContext'

function LoadingOverlay() {
  return (
    <Box
      style={{
        position: 'absolute',
        top: 40,
        right: 0,
        left: 0,
        bottom: 50,
        backgroundColor: 'rgba(250, 250, 250, 1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999
      }}
    ></Box>
  )
}

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
    refresh = true,
    Title,
    nextToTitle,
    onSave,
    onClear,
    onInfo,
    controlled,
    editMode = false,
    disabledSubmit,
    disabledInfo,
    onApply,
    disabledApply,
    spacing,
    isLoading = true,
    ...props
  }) => {
    const { settings } = useSettings()
    const { navCollapsed } = settings
    const [expanded, setExpanded] = useState(false)
    const [minimized, setMinimized] = useState(false)
    const paperRef = useRef(null)
    const maxAccess = props.maxAccess?.record.maxAccess

    const { loading } = useContext(RequestsContext)
    const [showOverlay, setShowOverlay] = useState(false)

    const windowToolbarVisible = useMemo(
      () => (editMode ? maxAccess >= TrxType.EDIT : maxAccess >= TrxType.ADD),
      [editMode, maxAccess]
    )

    const containerWidth = window.innerWidth - (navCollapsed ? 10 : 310)
    const containerHeight = window.innerHeight - 40
    const containerHeightPanel = window.innerHeight - 180
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

    useEffect(() => {
      const body = document.body
      if (expanded || minimized) {
        body.style.overflow = 'hidden'
      } else {
        body.style.overflow = ''
      }

      return () => {
        body.style.overflow = ''
      }
    }, [expanded, minimized])

    useEffect(() => {
      if (!loading) {
        const timer = setTimeout(() => {
          setShowOverlay(true)
        }, 50)

        return () => clearTimeout(timer)
      }
    }, [loading])

    const handleExpandToggle = useCallback(() => {
      setExpanded(prev => !prev)
    }, [])

    const handleMinimizeToggle = useCallback(() => {
      if (expanded) setExpanded(false)
      setMinimized(prev => !prev)
    }, [expanded])

    return (
      <CacheDataProvider>
        <Box
          id='parent'
          sx={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            position: 'absolute',
            overflow: 'hidden',
            width: spacing ? containerWidth : '100%',
            height: spacing ? containerHeight : '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: minimized ? 'flex-end' : 'center',
            zIndex: 2
          }}
          onKeyDown={e => {
            if (e.key === 'Escape' && closable) {
              onClose()
            }
          }}
        >
          <Draggable
            handle='#draggable-dialog-title'
            cancel={'[class*="MuiDialogContent-root"]'}
            bounds='parent'
            position={expanded || minimized ? { x: 0, y: 0 } : undefined}
            onStart={() => draggable}
          >
            <Box
              sx={{
                position: 'relative',
                pointerEvents: 'all',
                mb: minimized ? '5px' : 0
              }}
            >
              <Paper
                ref={paperRef}
                tabIndex={-1}
                sx={{
                  transition:
                    'max-height 0.35s ease, width 0.35s ease, background-color 0.35s ease, opacity 0.25s ease',
                  height: !minimized
                    ? controlled
                      ? expanded
                        ? containerHeight
                        : height
                      : expanded
                      ? containerHeight
                      : height
                    : '40px',
                  opacity: minimized ? 0.85 : 1,
                  width: expanded ? containerWidth : width,
                  display: controlled ? 'flex' : 'block',
                  flexDirection: controlled ? 'column' : 'unset',
                  '&:focus': { outline: 'none', boxShadow: 'none' },
                  backgroundColor: minimized ? 'rgba(255, 255, 255, 0.4)' : 'background.paper',
                  backdropFilter: minimized ? 'blur(4px)' : 'none',
                  boxShadow: minimized ? 'none' : 6,
                  overflow: 'hidden'
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
                    height: '40px',
                    zIndex: 10
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: '1.2rem', fontWeight: 600, color: 'white !important' }}>
                      {nextToTitle ? `${Title} ${nextToTitle}` : Title}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      tabIndex={-1}
                      edge='end'
                      onClick={handleMinimizeToggle}
                      aria-label='minimize'
                      sx={{ color: 'white !important' }}
                    >
                      <MinimizeIcon />
                    </IconButton>
                    {refresh && (
                      <IconButton
                        tabIndex={-1}
                        edge='end'
                        onClick={props?.onRefresh}
                        aria-label='refresh'
                        sx={{ color: 'white !important' }}
                      >
                        <RefreshIcon />
                      </IconButton>
                    )}
                    {expandable && !minimized && (
                      <IconButton
                        tabIndex={-1}
                        edge='end'
                        onClick={handleExpandToggle}
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
                  <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
                    {tabs.map((tab, i) => (
                      <Tab key={i} label={tab.label} disabled={tab?.disabled} />
                    ))}
                  </Tabs>
                )}
                {!showOverlay && isLoading && LoadingOverlay()}

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
                  React.Children.map(children, child =>
                    React.cloneElement(child, {
                      expanded: expanded,
                      height: expanded ? containerHeightPanel : heightPanel
                    })
                  )
                )}
              </Paper>
            </Box>
          </Draggable>
        </Box>
      </CacheDataProvider>
    )
  }
)

export default Window
