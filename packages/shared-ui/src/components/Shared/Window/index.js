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
  return (
    <Box
      className={styles.loadingOverlay}
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 9999
      }}
    />
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
    minimizable = true,
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
      screenWidth <= 1280 ? 210 :
      screenWidth <= 1366 ? 220 :
      screenWidth <= 1600 ? 240 : 300

    const sidebarWidth = navCollapsed ? 10 : menuWidth
    const containerWidth = `calc(100vw - ${sidebarWidth}px)`
    const containerHeight = `calc(100vh - var(--tabs-height, 40px))`
    const availableWidth = Math.max(0, screenWidth - sidebarWidth)

    const safeScreenHeight =
      screenHeight || (typeof window !== 'undefined' ? window.innerHeight : 0)

    const tabsHeight = 40
    const availableHeight = Math.max(0, safeScreenHeight - tabsHeight)

    const padding = 20

    const fitScaleW = (() => {
      const fit = width ? Math.max(0, availableWidth - padding) / width : 1
      return Number.isFinite(fit) ? fit : 1
    })()

    const fitScaleH = (() => {
      const fit = height ? Math.max(0, availableHeight - padding) / height : 1
      return Number.isFinite(fit) ? fit : 1
    })()

    const responsiveScale = (() => {
      const baseW = 1280
      const baseH = 800

      const w = baseW ? availableWidth / baseW : 1
      const h = baseH ? availableHeight / baseH : 1

      const s = Math.min(1, w, h)
      return Math.max(0.8, s)
    })()

    const scaleFactor = Math.max(
      0.8,
      Math.min(1, fitScaleW, fitScaleH, responsiveScale)
    )

    const scaledWidth = expanded
      ? containerWidth
      : Math.min(availableWidth - 20, Math.max(300, width * scaleFactor))

    const scaledHeight = expanded
      ? containerHeight
      : Math.max(120, height * scaleFactor)

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
            cancel=".no-drag"
            bounds="parent"
            position={minimized || expanded ? { x: 0, y: 0 } : dragPos}
            disabled={minimized || expanded || !draggable}
            onStop={(_, data) => {
              if (!expanded && !minimized) setDragPos({ x: data.x, y: data.y })
            }}
          >
            <Box sx={{ position: 'relative', pointerEvents: 'all', mb: minimized ? '5px' : 0 }}>
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
                    {minimizable && (
                      <IconButton className={`${styles.iconButton} no-drag`} onClick={handleMinimizeToggle}>
                        <MinimizeIcon />
                      </IconButton>
                    )}

                    {refresh && !minimized && (
                      <IconButton className={`${styles.iconButton} no-drag`} onClick={props?.onRefresh}>
                        <RefreshIcon />
                      </IconButton>
                    )}

                    {expandable && !minimized && (
                      <IconButton className={`${styles.iconButton} no-drag`} onClick={handleExpandToggle}>
                        <OpenInFullIcon />
                      </IconButton>
                    )}

                    {closable && (
                      <IconButton className={`${styles.iconButton} no-drag`} onClick={onClose}>
                        <ClearIcon />
                      </IconButton>
                    )}
                  </Box>
                </DialogTitle>

                <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  {tabs && (
                    <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                      {tabs.map((tab, i) => (
                        <Tab key={i} label={tab.label} disabled={tab?.disabled} />
                      ))}
                    </Tabs>
                  )}

                  <Box
                    sx={{
                      flex: 1,
                      minHeight: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    {!showOverlay && isLoading && <LoadingOverlay />}

                    {!controlled ? (
                      <Box
                        sx={{
                          flex: 1,
                          minHeight: 0,
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden'
                        }}
                      >
                        {children}
                      </Box>
                    ) : (
                      React.Children.map(children, child =>
                        React.cloneElement(child, {
                          fill: true,
                          expanded
                        })
                      )
                    )}
                  </Box>

                  {windowToolbarVisible && !controlled && (
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
