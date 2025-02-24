import React, { createContext, useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/router'
import { Tabs, Tab, Box, IconButton, Menu, MenuItem } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PropTypes from 'prop-types'
import { MenuContext } from 'src/providers/MenuContext'
import { v4 as uuidv4 } from 'uuid'

const TabsContext = createContext()

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props

  return (
    <Box
      role='tabpanel'
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      sx={{
        display: value !== index ? 'none !important' : 'flex !important',
        flexDirection: 'column',
        width: '100%',
        flex: '1 !important',
        overflow: 'auto',
        paddingTop: '5px',
        position: 'relative',
        backgroundColor: 'white'
      }}
      {...other}
    >
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

  const [anchorEl, setAnchorEl] = useState(null)

  const [tabsIndex, setTabsIndex] = useState(null)
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const { dashboardId } = JSON.parse(window.sessionStorage.getItem('userData'))

  const open = Boolean(anchorEl)

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
        if (result) {
          return result
        }
      } else if (node.path && node.path === targetRouter) {
        return node.name
      }
    }

    return null
  }

  const handleChange = (event, newValue) => {
    setCurrentTabIndex(newValue)
    window.history.replaceState(null, '', openTabs[newValue].route)
  }

  const handleCloseAllTabs = () => {
    const firstTab = openTabs[0]
    router.push(firstTab.route)
    setOpenTabs([firstTab])
    setCurrentTabIndex(0)
  }

  const handleCloseOtherTab = tabIndex => {
    const homeTab = openTabs[0]
    const selectedTab = openTabs[tabIndex]
    const isHomeTabSelected = selectedTab.route === homeTab.route

    const newOpenTabs = openTabs.filter((tab, index) => index === 0 || index === tabIndex)

    router.push(selectedTab.route)
    setOpenTabs(newOpenTabs)
    setCurrentTabIndex(isHomeTabSelected ? 0 : newOpenTabs.length - 1)
  }

  const closeTab = tabRoute => {
    const index = openTabs.findIndex(tab => tab.route === tabRoute)
    const activeTabsLength = openTabs.length

    if (activeTabsLength === 2) {
      handleCloseAllTabs()

      return
    }

    if (currentTabIndex === index) {
      const newValue = index === activeTabsLength - 1 ? index - 1 : index + 1

      // if closing last tab

      if (newValue === index - 1 || router.asPath === window?.history?.state?.as) {
        setCurrentTabIndex(newValue)
      }

      window.history.replaceState(null, '', openTabs?.[newValue]?.route)
    } else if (index < currentTabIndex) {
      setCurrentTabIndex(currentValue => currentValue - 1)
    }

    setOpenTabs(prevState => prevState.filter(tab => tab.route !== tabRoute))
  }

  const reopenTab = tabRoute => {
    setOpenTabs(openTabs => openTabs.map(tab => (tab.route === tabRoute ? { ...tab, id: uuidv4() } : tab)))
    router.push(tabRoute)
    setReloadOpenedPage([])
  }

  useEffect(() => {
    console.log('openTabs-2', openTabs)
    if (initialLoadDone) {
      const isTabOpen = openTabs.some((activeTab, index) => {
        if (activeTab.route === router.asPath || !window?.history?.state?.as) {
          return true
        }

        return false
      })

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
              : findNode(menu, router.asPath.replace(/\/$/, '')) || findNode(gear, router.asPath.replace(/\/$/, ''))
          }
        ])

        setCurrentTabIndex(newValueState)
      } else {
        setOpenTabs(prevState =>
          prevState.map(tab => {
            if (tab.route === router.asPath) {
              return { ...tab, page: children }
            }

            return tab
          })
        )
      }
    }
  }, [router.asPath, window.history.state?.as])

  useEffect(() => {
    if (openTabs[currentTabIndex]?.route === reloadOpenedPage?.path + '/') reopenTab(reloadOpenedPage?.path + '/')

    if (!initialLoadDone && router.asPath && menu.length > 0) {
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
            : findNode(menu, router.asPath.replace(/\/$/, '')) || findNode(gear, router.asPath.replace(/\/$/, ''))
        })

        const index = newTabs.findIndex(tab => tab.route === router.asPath)
        setCurrentTabIndex(index)
      }

      setOpenTabs(newTabs)
      setInitialLoadDone(true)
    }
  }, [router.asPath, menu, gear, children, lastOpenedPage, initialLoadDone, reloadOpenedPage])

  return (
    <>
      <Box
        sx={{
          display: 'flex !important',
          flexDirection: 'column',
          width: '100%',
          flex: '1 !important',
          overflow: 'auto'
        }}
      >
        <Box sx={{ backgroundColor: '#231f20', pt: '5px', position: 'relative !important', zIndex: '3 !important' }}>
          <Tabs
            value={currentTabIndex}
            onChange={handleChange}
            variant='scrollable'
            scrollButtons={openTabs.length > 3 ? 'auto' : 'off'}
            aria-label='scrollable auto tabs example'
            sx={{
              minHeight: '35px !important',
              '.MuiTab-root': {
                color: 'white',
                backgroundColor: 'grey',
                '&:hover': {
                  color: 'grey',
                  backgroundColor: '#ddd'
                }
              },
              '.Mui-selected': {
                color: '#231f20',
                backgroundColor: 'white'
              },
              '.MuiTabs-indicator': {
                backgroundColor: 'white'
              },
              '.MuiSvgIcon-root': {
                color: 'white!important'
              },
              '.MuiTab-root .MuiSvgIcon-root': {
                color: '#5A585E !important'
              }
            }}
          >
            {openTabs.length > 0 &&
              openTabs.map((activeTab, i) => (
                <Tab
                  key={activeTab?.id}
                  label={activeTab?.label}
                  onContextMenu={event => OpenItems(event, i)}
                  icon={
                    activeTab.route === '/default/' ? null : (
                      <IconButton
                        size='small'
                        onClick={event => {
                          event.stopPropagation()
                          closeTab(activeTab.route)
                        }}
                      >
                        <CloseIcon fontSize='small' />
                      </IconButton>
                    )
                  }
                  iconPosition='end'
                  sx={{
                    minHeight: '35px !important',
                    borderTopLeftRadius: 5,
                    borderTopRightRadius: 5,
                    py: '0px !important',
                    mb: '0px !important',
                    borderBottom: '0px !important',
                    mr: '2px !important',
                    fontWeight: '1.5rem',
                    pr: '0px !important',
                    pl: '10px !important',
                    display: activeTab.route === '/default/' && dashboardId === null ? 'none' : 'flex'
                  }}
                />
              ))}
          </Tabs>
        </Box>
        {openTabs.length > 0 &&
          openTabs.map((activeTab, i) => (
            <CustomTabPanel key={activeTab.id} index={i} value={currentTabIndex}>
              {activeTab.page}
            </CustomTabPanel>
          ))}
      </Box>
      <Menu
        anchorEl={anchorEl}
        id='account-menu'
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        <MenuItem
          onClick={event => {
            closeTab(openTabs[tabsIndex]?.route)
            event.stopPropagation()
            handleClose()
          }}
        >
          <div>Close Tab</div>
        </MenuItem>
        <MenuItem
          onClick={event => {
            event.stopPropagation()
            handleCloseOtherTab(tabsIndex)
            handleClose()
          }}
        >
          <div>Close Other Tabs</div>
        </MenuItem>
        <MenuItem
          onClick={event => {
            event.stopPropagation()
            handleCloseAllTabs()
            handleClose()
          }}
        >
          <div>Close All Tabs</div>
        </MenuItem>
      </Menu>
    </>
  )
}

export { TabsContext, TabsProvider }
