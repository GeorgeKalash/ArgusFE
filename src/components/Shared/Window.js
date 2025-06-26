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
    const { loading } = useContext(RequestsContext)
    const [showOverlay, setShowOverlay] = useState(false)
    const memoizedChildren = useMemo(() => children, [])

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
      if (!loading) {
        const timer = setTimeout(() => {
          setShowOverlay(true)
        }, 50)

        return () => clearTimeout(timer)
      }
    }, [loading])

    const handleExpandToggle = useCallback(() => {
      setExpanded(prev => !prev)
    }, [expanded])

    const handleMinimizeToggle = useCallback(() => {
      if (expanded) setExpanded(false)
      setMinimized(prev => !prev)
    }, [expanded])

    return (
      <CacheDataProvider>
        <Box
          id='parent'
          sx={{
            bottom: 0,
            position: 'absolute',
            width: spacing ? containerWidth : '100%',
            height: spacing ? containerHeight : '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: minimized ? 'flex-end' : 'center',
            zIndex: 2
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
                  transition: 'width 0.3s, height 0.3s',
                  width: expanded ? containerWidth : width,
                  height: minimized && '40px',
                  display: controlled ? 'flex' : 'block',
                  flexDirection: controlled ? 'column' : 'unset',
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
                    m: 0,
                    backgroundColor: '#231F20',
                    height: '40px',
                    borderRadius: minimized ? '10px' : '5px 5px 0 0'
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: '1.2rem', fontWeight: 600, color: 'white !important' }}>
                      {nextToTitle ? Title + ' ' + nextToTitle : Title}
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

                {!minimized && (
                  <>
                    {tabs && (
                      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                        {tabs.map((tab, i) => (
                          <Tab key={i} label={tab.label} disabled={tab?.disabled} />
                        ))}
                      </Tabs>
                    )}

                    {!showOverlay && isLoading && <LoadingOverlay />}

                    {!controlled ? (
                      <>
                        <DialogContent sx={{ p: 2 }}>{memoizedChildren}</DialogContent>
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
                      React.Children.map(memoizedChildren, child => {
                        return React.cloneElement(child, {
                          expanded: expanded,
                          height: expanded ? containerHeightPanel : heightPanel
                        })
                      })
                    )}
                  </>
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
