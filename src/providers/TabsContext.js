// ** React Imports
import React, { createContext, useEffect, useState, useContext } from 'react';

// ** Next Import
import { useRouter } from 'next/router'

// ** MUI Imports
import { Tabs, Tab, Box } from '@mui/material'
import { IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import PropTypes from 'prop-types'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

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

  const [anchorEl, setAnchorEl] = React.useState(null)
  const open = Boolean(anchorEl)

  const handleClose = () => {
    setAnchorEl(null)
    setTabsIndex()
  };

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
  const [value, setValue] = useState(0)
  const [TabsIndex, setTabsIndex] = useState()
  const [closing, setClosing] = useState(false)

  const OpenItems = (event, i) => {
    setTabsIndex(i)   
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  };

  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const handleCloseAllTabs =  () => {
    router.push('/default/');
    setValue()
  };

  const handleCloseOtherTab = (Tab) => {
    const tab = activeTabs[Tab]
      setActiveTabs([])
      setValue(0)
      setActiveTabs([tab])
      router.push(tab.route)

  }

  const closeTab = (tabRoute) => {
    setClosing(true)
    const index = activeTabs.findIndex((tab) => tab.route === tabRoute);
    const lastValue = activeTabs.length;

    if (lastValue === 1) {
      router.push('/default/');
    } else {
      if (index === lastValue - 1) {
        const newValue = index > 0 ? index - 1 : 0;
        if (activeTabs[newValue]) {
          router.push(activeTabs[newValue].route);
        }
        setValue(newValue);
      } else if (value === lastValue - 1) {
        setValue(lastValue - 2);
      }
      
      setActiveTabs((prevState) => {
        return prevState.filter((tab) => tab.route !== tabRoute);
      });
    }
  };

  useEffect(() => { console.log(activeTabs)
    
    if(closing && value){
      if(activeTabs[value].route!=router.asPath){
        router.push(activeTabs[value].route)
      }
    }
    const currentPath = router.asPath;

    if(currentPath==='/default/'){
      setActiveTabs([]);

    } else if ( currentPath !== '/default/' && menu.length > 0) {
      const isTabOpen = activeTabs.some((tab) => tab.route === currentPath);
      if (!isTabOpen) {
        setActiveTabs((prevTabs) => [...prevTabs, {
          page: children,
          route: currentPath,
          label: lastOpenedPage ? lastOpenedPage.name : findNode(menu, router.asPath.replace(/\/$/, ''))
        }]);
        setValue(activeTabs.length);
      }
    }
  }, [router.asPath, value]);

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
                      onContextMenu={(event) => OpenItems(event, i)}
                      icon={
                        <IconButton
                          size='small'
                          onClick={(event) => {
                            event.stopPropagation();
                            closeTab(activeTab.route);
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
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose} 
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      >
        <MenuItem onClick={(event) => {
          closeTab(activeTabs[TabsIndex]?.route);
          event.stopPropagation();
          handleClose();
        }}>
          <div>
            Close Tab
          </div>
        </MenuItem>
        <MenuItem onClick={(event) =>{
          event.stopPropagation();
          handleCloseOtherTab(TabsIndex);
          handleClose();
        }}>
          <div>
            Close Other Tabs
          </div>
        </MenuItem>
        <MenuItem onClick={(event) =>{
          event.stopPropagation();
          handleCloseAllTabs();
          handleClose();
        }}>
          <div>
            Close All Tabs
          </div>
        </MenuItem>
      </Menu>
    </>
  );
};

export { TabsContext, TabsProvider }
