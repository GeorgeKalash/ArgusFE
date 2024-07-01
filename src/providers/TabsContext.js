import React, { createContext, useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/router'
import { Tabs, Tab, Box } from '@mui/material'
import { IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PropTypes from 'prop-types'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { MenuContext } from 'src/providers/MenuContext'

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
  const { menu, gear, lastOpenedPage } = useContext(MenuContext)

  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)

  const OpenItems = (event, i) => {
    setTabsIndex(i)
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)

    setTabsIndex()
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

  const [openTabs, setOpenTabs] = useState([])
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const [currentTabIndex, setCurrentTabIndex] = useState(0)
  const [TabsIndex, setTabsIndex] = useState()

  const handleChange = (event, newValue) => {
    setCurrentTabIndex(newValue)
  }

  const handleCloseAllTabs = () => {
    router.push('/default/')
    setOpenTabs([])
    setCurrentTabIndex()
  }

  const handleCloseOtherTab = Tab => {
    const tab = openTabs[Tab]
    router.push(tab.route)
    setOpenTabs([])
    setOpenTabs([tab])
    setCurrentTabIndex(0)
  }

  const closeTab = tabRoute => {
    const index = openTabs.findIndex(tab => tab.route === tabRoute)
    const activeTabsLength = openTabs.length

    setOpenTabs(prevState => {
      return prevState.filter(tab => tab.route !== tabRoute)
    })

    if (activeTabsLength === 1) {
      handleCloseAllTabs()

      return
    }

    if (currentTabIndex === index) {
      const newValue = index === activeTabsLength - 1 ? index - 1 : index + 1
      setCurrentTabIndex(newValue)

      router.push(openTabs[newValue].route)
    } else if (index < currentTabIndex) {
      setCurrentTabIndex(currentValue => currentValue - 1)
    }
  }

  useEffect(() => {
    if (router.asPath === '/default/') {
      setOpenTabs([])
    } else {
      if (initialLoadDone && router.asPath != '/default/') {
        const isTabOpen = openTabs.some((activeTab, index) => {
          if (activeTab.page === children || activeTab.route === router.asPath) {
            setCurrentTabIndex(index)

            return true
          }

          return false
        })
        if (isTabOpen) return
        else {
          const newValueState = openTabs.length
          setOpenTabs(prevState => {
            return [
              ...prevState,
              {
                page: children,
                route: router.asPath,
                label: lastOpenedPage
                  ? lastOpenedPage.name
                  : findNode(menu, router.asPath.replace(/\/$/, '')) || findNode(gear, router.asPath.replace(/\/$/, ''))
              }
            ]
          })
          setCurrentTabIndex(newValueState)
        }
      }
    }
  }, [children, router.asPath])

  useEffect(() => {
    if (router.asPath === '/default/') {
      return
    } else {
      if (!openTabs[0] && router.route != '/default/' && router.asPath && menu.length > 0) {
        setOpenTabs([
          {
            page: children,
            route: router.asPath,
            label: lastOpenedPage
              ? lastOpenedPage.name
              : findNode(menu, router.asPath.replace(/\/$/, '')) || findNode(gear, router.asPath.replace(/\/$/, ''))
          }
        ])
        setInitialLoadDone(true)
      }
    }
  }, [openTabs, router, menu, gear])

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
            scrollButtons='auto'
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
                display: 'none'
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
              openTabs.map((activeTab, i) => {
                return (
                  !activeTab.isDefault && (
                    <Tab
                      key={i}
                      label={activeTab?.label}
                      onClick={() => router?.push(activeTab.route)}
                      onContextMenu={event => OpenItems(event, i)}
                      icon={
                        <IconButton
                          size='small'
                          onClick={event => {
                            event.stopPropagation()
                            closeTab(activeTab.route)
                          }}
                        >
                          <CloseIcon fontSize='small' />
                        </IconButton>
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
                        pl: '10px !important'
                      }}
                    />
                  )
                )
              })}
          </Tabs>
        </Box>
        {openTabs.length > 0 &&
          openTabs.map((activeTab, i) => (
            <CustomTabPanel key={activeTab.route} index={i} value={currentTabIndex}>
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
            closeTab(openTabs[TabsIndex]?.route)
            event.stopPropagation()
            handleClose()
          }}
        >
          <div>Close Tab</div>
        </MenuItem>
        <MenuItem
          onClick={event => {
            event.stopPropagation()
            handleCloseOtherTab(TabsIndex)
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
