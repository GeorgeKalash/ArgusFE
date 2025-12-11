import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useContext
} from 'react'
import {
  DialogTitle,
  Paper,
  Tabs,
  Tab,
  Box,
  Typography,
  IconButton
} from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import RefreshIcon from '@mui/icons-material/Refresh'
import MinimizeIcon from '@mui/icons-material/Minimize'
import Draggable from 'react-draggable'
import WindowToolbar from '../WindowToolbar'
import { useSettings } from '@argus/shared-core/src/@core/hooks/useSettings'
import { TrxType } from '@argus/shared-domain/src/resources/AccessLevels'
import { CacheDataProvider } from '@argus/shared-providers/src/providers/CacheDataContext.js'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import styles from './Window.module.css'
import { useWindowDimensions } from '@argus/shared-domain/src/lib/useWindowDimensions'

function LoadingOverlay() {
  return <div className={styles.loadingOverlay} />
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
    isLoading = true,
    spacing = true,
    ...props
  }) => {
    const { settings } = useSettings()
    const { navCollapsed } = settings
    const { loading } = useContext(RequestsContext)

    const paperRef = useRef(null)
    const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
    const [restoreState, setRestoreState] = useState({
      width,
      height,
      expanded: false,
      position: { x: 0, y: 0 }
    })

    const [minimized, setMinimized] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const [showOverlay, setShowOverlay] = useState(false)

    const maxAccess = props.maxAccess?.record.maxAccess
    const windowToolbarVisible = useMemo(
      () => (editMode ? maxAccess >= TrxType.EDIT : maxAccess >= TrxType.ADD),
      [editMode, maxAccess]
    )

    const { width: screenWidth, height: screenHeight } = useWindowDimensions()

    const menuWidth =
      screenWidth <= 768 ? 180 :
      screenWidth <= 1024 ? 200 :
      screenWidth <= 1366 ? 220 :
      screenWidth <= 1600 ? 240 : 300

    const sidebarWidth = navCollapsed ? 10 : menuWidth
    const containerWidth = `calc(100vw - ${sidebarWidth}px)`
    const containerHeight = `calc(100vh - 40px)`

    const scaleFactor = (() => {
      if (screenWidth >= 1680) return 1
      if (screenWidth >= 1600) return 0.9

      const minW = 1024
      const maxW = 1600
      const minScale = 0.7
      const maxScale = 0.92

      if (screenWidth <= minW) return minScale
      return minScale + ((screenWidth - minW) / (maxW - minW)) * (maxScale - minScale)
    })()

    const scaledWidth = expanded ? containerWidth : Math.max(300, width * scaleFactor)
    const scaledHeight = expanded ? containerHeight : Math.max(200, height * scaleFactor)

    useEffect(() => {
      if (paperRef.current) paperRef.current.focus()
    }, [])

    useEffect(() => {
      if (!loading) {
        const timer = setTimeout(() => setShowOverlay(true), 50)
        return () => clearTimeout(timer)
      }
    }, [loading])

    useEffect(() => {
      document.body.style.overflow = minimized || expanded ? 'hidden' : ''
      return () => (document.body.style.overflow = '')
    }, [minimized, expanded])

    const handleExpandToggle = () => {
      if (!expanded) {
        setRestoreState({
          width: scaledWidth,
          height: scaledHeight,
          expanded,
          position: dragPos
        })

        setExpanded(true)
        setDragPos({ x: 0, y: 0 })

      } else {
        setExpanded(false)
        setDragPos(restoreState.position)
      }
    }

    const handleMinimizeToggle = () => {
      if (!minimized) {
        setRestoreState({
          width: scaledWidth,
          height: scaledHeight,
          expanded,
          position: dragPos
        })

        setExpanded(false)
        setMinimized(true)
        setDragPos({ x: 0, y: 0 })

      } else {
        setMinimized(false)
        setExpanded(restoreState.expanded)
        setDragPos(restoreState.position)
      }
    }

    return (
      <CacheDataProvider>
        <Box
          className={styles.parentBox}
          style={{
            width: spacing ? containerWidth : '100vw',
            height: spacing ? containerHeight : '100vh',
            alignItems: minimized ? 'flex-end' : 'center'
          }}
          onKeyDown={e => e.key === 'Escape' && closable && onClose()}
        >
          <Draggable
            handle="#draggable-dialog-title"
            cancel={'[class*="MuiDialogContent-root"]'}
            bounds="parent"
            position={minimized || expanded ? { x: 0, y: 0 } : dragPos}
            disabled={minimized || expanded}
            onStop={(_, data) => {
              if (!expanded && !minimized) {
                setDragPos({ x: data.x, y: data.y })
              }
            }}
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
                className={styles.paper}
                data-minimized={minimized}
                style={{
                  width: scaledWidth,
                  height: minimized ? 40 : scaledHeight,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                <DialogTitle id="draggable-dialog-title" className={styles.dialogTitle}>
                  <Typography className={styles.dialogTitleText}>
                    {nextToTitle ? `${Title} ${nextToTitle}` : Title}
                  </Typography>

                  <Box>
                    <IconButton onClick={handleMinimizeToggle} className={styles.iconButton}>
                      <MinimizeIcon />
                    </IconButton>

                    {refresh && !minimized && (
                      <IconButton onClick={props?.onRefresh} className={styles.iconButton}>
                        <RefreshIcon />
                      </IconButton>
                    )}

                    {expandable && !minimized && (
                      <IconButton onClick={handleExpandToggle} className={styles.iconButton}>
                        <OpenInFullIcon />
                      </IconButton>
                    )}

                    {closable && (
                      <IconButton onClick={onClose} className={styles.iconButton}>
                        <ClearIcon />
                      </IconButton>
                    )}
                  </Box>
                </DialogTitle>

                <Box
                  sx={{
                    flex: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: 0
                  }}
                >
                  {tabs && (
                    <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                      {tabs.map((tab, i) => (
                        <Tab key={i} label={tab.label} disabled={tab?.disabled} />
                      ))}
                    </Tabs>
                  )}

                  {!showOverlay && isLoading && <LoadingOverlay />}

                  {!controlled ? (
                    <>
                      <Box
                        sx={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          minHeight: 0,
                          overflow: 'hidden'
                        }}
                      >
                        {children}
                      </Box>

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
                        fill: true,
                        expanded
                      })
                    )
                  )}
                </Box>
              </Paper>
            </Box>
          </Draggable>
        </Box>
      </CacheDataProvider>
    )
  }
)

export default Window
