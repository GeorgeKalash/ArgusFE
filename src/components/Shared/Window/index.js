import React, { useEffect, useState, useCallback, useMemo, useRef, useContext } from 'react'
import { DialogTitle, DialogContent, Paper, Tabs, Tab, Box, Typography, IconButton, useMediaQuery } from '@mui/material'
import ClearIcon from '@mui/icons-material/Clear'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import RefreshIcon from '@mui/icons-material/Refresh'
import Draggable from 'react-draggable'
import WindowToolbar from '../WindowToolbar'
import { useSettings } from 'src/@core/hooks/useSettings'
import { TrxType } from 'src/resources/AccessLevels'
import { CacheDataProvider } from 'src/providers/CacheDataContext.js'
import { RequestsContext } from 'src/providers/RequestsContext'
import styles from './Window.module.css'

function LoadingOverlay() {
  return <Box className={styles.loadingOverlay}></Box>
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
    const paperRef = useRef(null)
    const maxAccess = props.maxAccess?.record.maxAccess

    const { loading } = useContext(RequestsContext)
    const [showOverlay, setShowOverlay] = useState(false)
    const overlayRef = useRef(null)

    const windowToolbarVisible = useMemo(
      () => (editMode ? maxAccess >= TrxType.EDIT : maxAccess >= TrxType.ADD),
      [editMode, maxAccess]
    )

    const isSmallScreen = useMediaQuery('(max-width:600px)')
    const isMediumScreen = useMediaQuery('(max-width:960px)')

    const overlayRect = overlayRef.current?.getBoundingClientRect()
    const containerWidth = overlayRect?.width ?? window.innerWidth
    const containerHeight = overlayRect?.height ?? window.innerHeight

    const baseWidth = Math.min(width, containerWidth * (isSmallScreen ? 0.95 : isMediumScreen ? 0.85 : 0.7))
    const baseHeight = Math.min(height, containerHeight * (isSmallScreen ? 0.8 : isMediumScreen ? 0.85 : 0.7))

    const containerHeightPanel = containerHeight
    const heightPanel = baseHeight

    const paperStyle = {
      '--window-paper-width': expanded ? `${containerWidth}px` : `${baseWidth}px`,
      '--window-paper-height': expanded ? `${containerHeight}px` : `${baseHeight}px`
    }

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

    const overlayClassName = `${styles.overlay} ${
      spacing ? (navCollapsed ? styles.overlaySpacingCollapsed : styles.overlaySpacingExpanded) : styles.overlayFull
    }`

    return (
      <CacheDataProvider>
        <Box
          id='parent'
          ref={overlayRef}
          className={overlayClassName}
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
            position={expanded || isSmallScreen ? { x: 0, y: 0 } : undefined}
            onStart={() => draggable && !isSmallScreen}
            disabled={isSmallScreen}
          >
            <Box className={styles.draggableContainer}>
              <Paper
                ref={paperRef}
                tabIndex={-1}
                data-expanded={expanded ? 'true' : 'false'}
                className={`${styles.windowPaper} ${controlled ? styles.windowPaperControlled : ''}`}
                style={paperStyle}
              >
                <DialogTitle
                  id='draggable-dialog-title'
                  className={`${styles.dialogTitle} ${
                    draggable && !isSmallScreen ? styles.dialogTitleDraggable : styles.dialogTitleDefault
                  }`}
                >
                  <Box>
                    <Typography className={styles.titleText}>
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
                        className={styles.headerIconButton}
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
                        className={styles.headerIconButton}
                      >
                        <OpenInFullIcon />
                      </IconButton>
                    )}
                    {closable && (
                      <IconButton
                        tabIndex={-1}
                        edge='end'
                        onClick={onClose}
                        aria-label='close'
                        className={styles.headerIconButton}
                      >
                        <ClearIcon />
                      </IconButton>
                    )}
                  </Box>
                </DialogTitle>
                {tabs && (
                  <Tabs
                    value={activeTab}
                    onChange={(event, newValue) => setActiveTab(newValue)}
                    variant={isSmallScreen ? 'scrollable' : 'standard'}
                    scrollButtons={isSmallScreen ? 'auto' : 'off'}
                  >
                    {tabs.map((tab, i) => (
                      <Tab key={i} label={tab.label} disabled={tab?.disabled} />
                    ))}
                  </Tabs>
                )}
                {!showOverlay && isLoading && <LoadingOverlay />}

                {!controlled ? (
                  <>
                    <DialogContent className={styles.dialogContent}>{children}</DialogContent>
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
      </CacheDataProvider>
    )
  }
)

export default Window
