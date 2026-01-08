import React, { createContext, useEffect, useState, useContext, useRef } from 'react'
import { useRouter } from 'next/router'
import { Tabs, Tab, Box, IconButton, Menu, MenuItem } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import RefreshIcon from '@mui/icons-material/Refresh'
import PropTypes from 'prop-types'
import { MenuContext } from '@argus/shared-providers/src/providers/MenuContext'
import { v4 as uuidv4 } from 'uuid'
import { RequestsContext } from '../RequestsContext'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import { LockedScreensContext } from '../LockedScreensContext'
import styles from './TabsProvider.module.css'

const TabsContext = createContext()

function LoadingOverlay() {
  return <Box className={styles.loadingOverlay}></Box>
}

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props
  const { loading } = useContext(RequestsContext)
  const [showOverlay, setShowOverlay] = useState(false)

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setShowOverlay(true), 300)

      return () => clearTimeout(timer)
    }
  }, [loading])

  return (
    <Box
      role='tabpanel'
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      className={`${styles.customTabPanel} ${value !== index ? styles.hidden : ''}`}
      {...other}
    >
      {!showOverlay && <LoadingOverlay />}
      {children}
    </Box>
  )
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
}

const TabsProvider = ({ children }) => {
  const router = useRouter()

  const {
    menu,
    gear,
    lastOpenedPage,
    reloadOpenedPage,
    setReloadOpenedPage,
    openTabs,
    setOpenTabs,
    currentTabIndex,
    setCurrentTabIndex
  } = useContext(MenuContext)

  const { lockedScreens, removeLockedScreen } = useContext(LockedScreensContext)
  const [anchorEl, setAnchorEl] = useState(null)
  const [tabsIndex, setTabsIndex] = useState(null)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  const tabsWrapperRef = useRef(null)

  const { dashboardId } = JSON.parse(window.sessionStorage.getItem('userData'))
  const userId = JSON.parse(window.sessionStorage.getItem('userData'))?.userId
  const { postRequest } = useContext(RequestsContext)
  const open = Boolean(anchorEl)

  useEffect(() => {
    if (!tabsWrapperRef.current) return

    const updateHeight = () => {
      const h = tabsWrapperRef.current.offsetHeight
      document.documentElement.style.setProperty('--tabs-height', `${h}px`)
    }

    updateHeight()

    const ro = new ResizeObserver(updateHeight)
    ro.observe(tabsWrapperRef.current)

    return () => ro.disconnect()
  }, [])

  const OpenItems = (event, i) => {
    setTabsIndex(i)
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setTabsIndex(null)
  }

  const findNode = (nodes, targetRouter) => {
    for (const node of nodes) {
      if (node.children) {
        const result = findNode(node.children, targetRouter)
        if (result) return result
      } else if (node.path && node.path === targetRouter) {
        return node.name
      }
    }

    return null
  }

  const findResourceId = (nodes, targetRouter) => {
    for (const node of nodes) {
      if (node.children) {
        const result = findResourceId(node.children, targetRouter)
        if (result) return result
      } else if (node.path && node.path === targetRouter) {
        return node.resourceId
      }
    }

    return null
  }

  const handleChange = (event, newValue) => {
    setCurrentTabIndex(newValue)
    if (newValue === 0 && !openTabs[newValue].page) router.push(openTabs[newValue].route)
    else window.history.replaceState(null, '', openTabs[newValue].route)
  }

  const handleCloseAllTabs = () => {
    const firstTab = openTabs[0]
    window.history.replaceState(null, '', firstTab.route)
    setOpenTabs([firstTab])
    setCurrentTabIndex(0)
  }

  const handleCloseOtherTab = tabIndex => {
    const homeTab = openTabs[0]
    const selectedTab = openTabs[tabIndex]
    const isHomeTabSelected = selectedTab.route === homeTab.route

    const newOpenTabs = openTabs.filter((tab, index) => index === 0 || index === tabIndex)

    window.history.replaceState(null, '', selectedTab.route)
    setOpenTabs(newOpenTabs)
    setCurrentTabIndex(isHomeTabSelected ? 0 : newOpenTabs.length - 1)
  }

  const closeTab = tabRoute => {
    const index = openTabs.findIndex(tab => tab.route === tabRoute)
    const activeTabsLength = openTabs.length

    if (activeTabsLength === 2) return handleCloseAllTabs()

    if (currentTabIndex === index) {
      const newValue = index === activeTabsLength - 1 ? index - 1 : index + 1
      if (newValue === index - 1 || router.asPath === window?.history?.state?.as) setCurrentTabIndex(newValue)
      window.history.replaceState(null, '', openTabs?.[newValue]?.route)
    } else if (index < currentTabIndex) setCurrentTabIndex(currentValue => currentValue - 1)

    setOpenTabs(prevState => prevState.filter(tab => tab.route !== tabRoute))
  }

  const reopenTab = tabRoute => {
    if (tabRoute === router.asPath) {
      setOpenTabs(openTabs => openTabs.map(tab => (tab.route === tabRoute ? { ...tab, id: uuidv4() } : tab)))
      setReloadOpenedPage([])
    } else router.push(tabRoute)
  }

  useEffect(() => {
    if (initialLoadDone) {
      const isTabOpen = openTabs.some(tab => tab.route === router.asPath || !window?.history?.state?.as)
      if (!isTabOpen) {
        const newValueState = openTabs.length
        setOpenTabs(prevState => [
          ...prevState,
          {
            page: children,
            id: uuidv4(),
            route: router.asPath,
            label: lastOpenedPage
              ? lastOpenedPage.name
              : findNode(menu, router.asPath.replace(/\/$/, '')) || findNode(gear, router.asPath.replace(/\/$/, '')),
            resourceId: findResourceId(menu, router.asPath.replace(/\/$/, ''))
          }
        ])
        setCurrentTabIndex(newValueState)
      } else {
        setOpenTabs(prevState =>
          prevState.map(tab => {
            if (tab.route === router.asPath) return { ...tab, page: children }

            return tab
          })
        )
      }
    }
  }, [router.asPath, window.history?.state?.as])

  useEffect(() => {
    if (openTabs[currentTabIndex]?.route === reloadOpenedPage?.path + '/') reopenTab(reloadOpenedPage?.path + '/')

    if (!initialLoadDone && router.asPath && (menu.length > 0 || dashboardId)) {
      const newTabs = [
        {
          page: router.asPath === '/default/' ? children : null,
          id: uuidv4(),
          route: '/default/',
          label: 'Home'
        }
      ]

      if (router.asPath !== '/default/') {
        newTabs.push({
          page: children,
          id: uuidv4(),
          route: router.asPath,
          label: lastOpenedPage
            ? lastOpenedPage.name
            : findNode(menu, router.asPath.replace(/\/$/, '')) || findNode(gear, router.asPath.replace(/\/$/, '')),
          resourceId: findResourceId(menu, router.asPath.replace(/\/$/, ''))
        })
        setCurrentTabIndex(newTabs.findIndex(tab => tab.route === router.asPath))
      }

      setOpenTabs(newTabs)
      menu.length > 0 && setInitialLoadDone(true)
    }
  }, [router.asPath, menu, gear, children, lastOpenedPage, initialLoadDone, reloadOpenedPage])

  function unlockRecord(resourceId) {
    const body = {
      resourceId,
      recordId: 0,
      reference: '',
      userId,
      clockStamp: new Date()
    }
    postRequest({
      extension: AccessControlRepository.unlockRecord,
      record: JSON.stringify(body)
    })

    removeLockedScreen(resourceId)
  }

  const unlockIfLocked = tab => {
    if (!tab?.resourceId) return
    const locked = lockedScreens.some(screen => screen.resourceId === tab.resourceId)
    if (locked) unlockRecord(tab.resourceId)
  }

  return (
    <>
      <Box ref={tabsWrapperRef} className={styles.tabsWrapper}>
        <Tabs
          value={currentTabIndex}
          onChange={handleChange}
          variant='scrollable'
          scrollButtons={openTabs.length > 3 ? 'auto' : 'off'}
          aria-label='scrollable auto tabs example'
          classes={{ indicator: styles.tabsIndicator }}
          className={styles.tabs}
        >
          {openTabs.map((activeTab, i) => (
            <Tab
              key={activeTab?.id}
              className={styles.tabName}
              label={
                <Box display='flex' alignItems='center'>
                  <span>{activeTab.label}</span>
                  {i === currentTabIndex && (
                    <IconButton
                      size='small'
                      className={styles.svgIcon}
                      onClick={e => {
                        e.stopPropagation()
                        setReloadOpenedPage({ path: openTabs[i].route.replace(/\/$/, ''), name: openTabs[i].label })
                      }}
                    >
                      <RefreshIcon className={styles.svgIcon} />
                    </IconButton>
                  )}
                  {activeTab.route !== '/default/' && (
                    <IconButton
                      size='small'
                      className={styles.svgIcon}
                      onClick={event => {
                        event.stopPropagation()
                        if (activeTab) unlockIfLocked(activeTab)
                        closeTab(activeTab.route)
                      }}
                    >
                      <CloseIcon className={styles.svgIcon} />
                    </IconButton>
                  )}
                </Box>
              }
              onContextMenu={event => OpenItems(event, i)}
                classes={{
                  root: styles.tabRoot,
                  selected: styles.selectedTab
                }}
            />
          ))}
        </Tabs>
      </Box>

      {openTabs.map((activeTab, i) => (
        <CustomTabPanel key={activeTab.id} index={i} value={currentTabIndex}>
          {activeTab.page}
        </CustomTabPanel>
      ))}
      <Menu
        anchorEl={anchorEl}
        id='account-menu'
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        className={styles.dropdownMenu}
      >
        <MenuItem
          className={styles.dropdownItem}
          onClick={event => {
            closeTab(openTabs[tabsIndex]?.route)
            event.stopPropagation()
            handleClose()
          }}
        >
          Close Tab
        </MenuItem>
        <MenuItem
          className={styles.dropdownItem}
          onClick={event => {
            event.stopPropagation()
            handleCloseOtherTab(tabsIndex)
            handleClose()
          }}
        >
          Close Other Tabs
        </MenuItem>
        <MenuItem
          className={styles.dropdownItem}
          onClick={event => {
            event.stopPropagation()
            handleCloseAllTabs()
            handleClose()
          }}
        >
          Close All Tabs
        </MenuItem>
      </Menu>
    </>
  )
}

export { TabsContext, TabsProvider }
