import React, { useEffect, useState, useCallback, useMemo, useRef, useContext } from 'react'
import { DialogTitle, DialogContent, Paper, Tabs, Tab, Box, Typography, IconButton } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import RefreshIcon from '@mui/icons-material/Refresh'
import Draggable from 'react-draggable'
import WindowToolbar from '../WindowToolbar'
import { useSettings } from '@argus/shared-core/src/@core/hooks/useSettings'
import { TrxType } from '@argus/shared-domain/src/resources/AccessLevels'
import { CacheDataProvider } from '@argus/shared-providers/src/providers/CacheDataContext.js'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import styles from './Window.module.css'
import { useWindowDimensions } from '@argus/shared-domain/src/lib/useWindowDimensions'

function LoadingOverlay() {
  return <div className={styles.loadingOverlay}></div>
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
    const [expanded, setExpanded] = useState(false)
    const [showOverlay, setShowOverlay] = useState(false)
    const maxAccess = props.maxAccess?.record.maxAccess

    const windowToolbarVisible = useMemo(
      () => (editMode ? maxAccess >= TrxType.EDIT : maxAccess >= TrxType.ADD),
      [editMode, maxAccess]
    )

    const { width: screenWidth, height: screenHeight } = useWindowDimensions()

    const menuWidth =
      screenWidth <= 768 ? 180 : screenWidth <= 1024 ? 200 : screenWidth <= 1366 ? 220 : screenWidth <= 1600 ? 240 : 300

    const tabsHeight =
      screenWidth <= 768 ? 25 : screenWidth <= 1024 ? 20 : screenWidth <= 1366 ? 28 : screenWidth <= 1600 ? 30 : 40

    const sidebarWidth = navCollapsed ? 10 : menuWidth
    const containerWidth = `calc(100vw - ${sidebarWidth}px)`
    const containerHeight = `calc(100vh - ${tabsHeight}px)`
    const containerHeightPanel = screenHeight - 180
    const heightPanel = height - 120

    const scaleFactor = useMemo(() => {
      if (screenWidth > 1600) return 1
      if (screenWidth > 1400) return 0.8
      if (screenWidth > 1366) return 0.83
      if (screenWidth > 768) return 0.8
      if (screenWidth > 600) return 0.75
      if (screenWidth > 480) return 0.7
      if (screenWidth > 375) return 0.65

      return 0.6
    }, [screenWidth])

    const heightScaleFactor = useMemo(() => {
      if (screenWidth > 1600) return 1
      if (screenWidth > 1359) return 0.85
      if (screenWidth > 1024) return 0.95
      if (screenWidth > 768) return 0.9
      if (screenWidth > 600) return 0.85
      if (screenWidth > 480) return 0.8
      if (screenWidth > 375) return 0.75

      return 0.75
    }, [screenWidth])

    const scaledWidth = expanded ? containerWidth : Math.max(300, width * scaleFactor)
    const scaledHeight = expanded ? containerHeight : Math.max(200, height * heightScaleFactor)

    useEffect(() => {
      const transactionLogInfo = document.querySelector('[data-unique-id]')
      if (transactionLogInfo) {
        transactionLogInfo.style.height = expanded ? '30vh' : '18vh'
      }
    }, [expanded])

    useEffect(() => {
      if (paperRef.current) paperRef.current.focus()
    }, [])

    useEffect(() => {
      if (!loading) {
        const timer = setTimeout(() => setShowOverlay(true), 50)

        return () => clearTimeout(timer)
      }
    }, [loading])

    const handleExpandToggle = useCallback(() => {
      setExpanded(prev => !prev)
    }, [])

    return (
      <CacheDataProvider>
        <Box
          id='parent'
          className={styles.parentBox}
          style={{
            width: spacing ? containerWidth : '100vw',
            height: spacing ? containerHeight : '100vh'
          }}
          onKeyDown={e => e.key === 'Escape' && closable && onClose()}
        >
          <Draggable
            handle='#draggable-dialog-title'
            cancel={'[class*="MuiDialogContent-root"]'}
            bounds='parent'
            position={expanded ? { x: 0, y: 0 } : undefined}
            onStart={() => draggable}
          >
            <Box sx={{ position: 'relative', pointerEvents: 'all' }}>
              <Paper
                ref={paperRef}
                tabIndex={-1}
                className={styles.paper}
                data-expanded={expanded}
                style={{
                  width: scaledWidth,
                  height: scaledHeight,
                  display: controlled ? 'flex' : 'block',
                  flexDirection: controlled ? 'column' : 'unset'
                }}
              >
                <DialogTitle id='draggable-dialog-title' className={styles.dialogTitle}>
                  <Box>
                    <Typography className={styles.dialogTitleText}>
                      {nextToTitle ? Title + ' ' + nextToTitle : Title}
                    </Typography>
                  </Box>
                  <Box>
                    {refresh && (
                      <IconButton
                        tabIndex={-1}
                        edge='end'
                        onClick={props?.onRefresh}
                        aria-label='refresh'
                        className={styles.iconButton}
                      >
                        <RefreshIcon />
                      </IconButton>
                    )}
                    {expandable && (
                      <IconButton
                        tabIndex={-1}
                        edge='end'
                        onClick={handleExpandToggle}
                        data-is-expanded={expanded}
                        aria-label='expand'
                        className={styles.iconButton}
                      >
                        <OpenInFullIcon />
                      </IconButton>
                    )}
                    {closable && (
                      <IconButton
                        tabIndex={-1}
                        edge='end'
                        onClick={onClose}
                        aria-label='clear input'
                        className={styles.iconButton}
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
                {!showOverlay && isLoading && <LoadingOverlay />}
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
                      expanded,
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
