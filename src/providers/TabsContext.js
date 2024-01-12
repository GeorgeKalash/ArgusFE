// ** React Imports
import { createContext, useEffect, useState, useContext } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import { Tabs, Tab, Box } from '@mui/material'
import { IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PropTypes from 'prop-types'

// ** Context
import { MenuContext } from 'src/providers/MenuContext'

const TabsContext = createContext()

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props

  //NOTE: EVERY PAGE PADDING CAN BE ADDED HERE

  return (
    <Box
      role='tabpanel'
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      sx={{ height: '100%' }}
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
  // ** Hooks
  const router = useRouter()
  const { menu, lastOpenedPage } = useContext(MenuContext)

  const getLabel = () => {
    const parts = router.route.split('/')

    return parts[parts.length - 1]
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

  // ** States
  const [activeTabs, setActiveTabs] = useState([])
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const [value, setValue] = useState(0)

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const closeTab = tabRoute => {
    const index = activeTabs.findIndex(tab => tab.route === tabRoute)
    if (index === value) {
      const newValue = index > 0 ? index - 1 : 1
      if (activeTabs[newValue]) {
        router.push(activeTabs[newValue].route)
      }
      setValue(newValue - 1 >= 0 ? newValue - 1 : 0)
    } else if (value === activeTabs.length - 1) {
      if (activeTabs[index - 1]) {
        router.push(activeTabs[index - 1].route)
      }
      setValue(activeTabs.length - 2)
    }

    setActiveTabs(prevState => {
      prevState = prevState.filter(tab => tab.route !== tabRoute)

      return prevState
    })
  }

  useEffect(() => {
    if (initialLoadDone && router.asPath != '/default') {
      const isTabOpen = activeTabs.some(activeTab => activeTab.page === children || activeTab.route === router.asPath)
      if (isTabOpen) return
      else {
        const newValueState = activeTabs.length
        setActiveTabs(prevState => {
          return [
            ...prevState,
            {
              page: children,
              route: router.asPath,
              label: lastOpenedPage ? lastOpenedPage.name : findNode(menu, router.asPath.replace(/\/$/, ''))
            }
          ]
        })
        setValue(newValueState)
      }
    }
  }, [children, router.asPath])

  useEffect(() => {
    if (!activeTabs[0] && router.route != '/default' && router.asPath && menu.length > 0) {
      setActiveTabs([
        {
          page: children,
          route: router.asPath,
          label: findNode(menu, router.asPath.replace(/\/$/, ''))
        }
      ])
      setInitialLoadDone(true)
    }
  }, [activeTabs, router, menu])

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="scrollable auto tabs example"
            sx={{maxHeight: '40px'}}
          >
            {activeTabs.length > 0 &&
              activeTabs.map((activeTab, i) => {
                return (
                  !activeTab.isDefault && (
                    <Tab
                      key={i}
                      label={activeTab?.label}
                      onClick={() => router?.push(activeTab.route)}
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
                      sx={{ minHeight: '40px' }}
                    />
                  )
                )
              })}
          </Tabs>
        </Box>
        {activeTabs.length > 0 &&
          activeTabs.map((activeTab, i) => (
            <CustomTabPanel key={i} index={i} value={value}>
              {activeTab.page}
            </CustomTabPanel>
          ))}
      </Box>
    </>
  )
}

export { TabsContext, TabsProvider }
