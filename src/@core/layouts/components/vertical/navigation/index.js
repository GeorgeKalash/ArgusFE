// ** React Import
import { useEffect, useRef, useState, useContext } from 'react'
import * as React from 'react';

// ** Next Imports
import Image from 'next/image';

// ** MUI Imports
import List from '@mui/material/List'
import Box from '@mui/material/Box'
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import GradeIcon from '@mui/icons-material/Grade';
import { createTheme, responsiveFontSizes, styled, ThemeProvider } from '@mui/material/styles'

// ** Third Party Components
import PerfectScrollbar from 'react-perfect-scrollbar'

// ** Theme Config
import themeConfig from 'src/configs/themeConfig'

// ** Component Imports
import Drawer from './Drawer'
import VerticalNavItems from './VerticalNavItems'
import VerticalNavHeader from './VerticalNavHeader'
import Dropdown from './Dropdown';

// ** Theme Options
import themeOptions from 'src/@core/theme/ThemeOptions'

// ** Util Import
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

import { useRouter } from 'next/router';
import { MenuContext } from 'src/providers/MenuContext';

import { useAuth } from 'src/hooks/useAuth'

const StyledBoxForShadow = styled(Box)(({ theme }) => ({
  top: 60,
  left: -8,
  zIndex: 2,
  opacity: 0,
  position: 'absolute',
  pointerEvents: 'none',
  width: 'calc(100% + 15px)',
  height: theme.mixins.toolbar.minHeight,
  transition: 'opacity .15s ease-in-out',
  background: `linear-gradient(${theme.palette.background.default} ${theme.direction === 'rtl' ? '95%' : '5%'
    },${hexToRGBA(theme.palette.background.default, 0.85)} 30%,${hexToRGBA(
      theme.palette.background.default,
      0.5
    )} 65%,${hexToRGBA(theme.palette.background.default, 0.3)} 75%,transparent)`,
  '&.scrolled': {
    opacity: 1
  }
}))

const Navigation = props => {  

  const router = useRouter();
  
  // ** Props
  const { hidden, settings, afterNavMenuContent, beforeNavMenuContent, navMenuContent: userNavMenuContent } = props 
  const {  setLastOpenedPage } = useContext(MenuContext)

  // ** States
  // const [navHover, setNavHover] = useState(false)
  const [currentActiveGroup, setCurrentActiveGroup] = useState([])
  const [filteredMenu, setFilteredMenu] = useState([]) //menu
  const [openFolders, setOpenFolders] = useState([]);
  const menu = props.verticalNavItems //menu
  const gear = useContext(MenuContext)
  const [isArabic, setIsArabic] = useState(false)
  const auth = useAuth()

  // ** Ref
  const shadowRef = useRef(null)

  // ** Var
  const { navCollapsed } = settings
  const { afterVerticalNavMenuContentPosition, beforeVerticalNavMenuContentPosition } = themeConfig

  const navMenuContentProps = {
    ...props,
    currentActiveGroup,
    setCurrentActiveGroup
  }

  // ** Create new theme for the navigation menu when mode is `semi-dark`
  let darkTheme = createTheme(themeOptions(settings, 'dark'))

  // ** Set responsive font sizes to true
  if (themeConfig.responsiveFontSizes) {
    darkTheme = responsiveFontSizes(darkTheme)
  }

  // ** Fixes Navigation InfiniteScroll
  const handleInfiniteScroll = ref => {
    if (ref) {
      // @ts-ignore
      ref._getBoundingClientRect = ref.getBoundingClientRect
      ref.getBoundingClientRect = () => {
        // @ts-ignore
        const original = ref._getBoundingClientRect()

        return { ...original, height: Math.floor(original.height) }
      }
    }
  }

  useEffect (()=>{
    if(auth?.user?.languageId === 2) setIsArabic(true)
    else setIsArabic(false)
  }, [])

  // ** Scroll Menu
  const scrollMenu = container => {
    if (beforeVerticalNavMenuContentPosition === 'static' || !beforeNavMenuContent) {
      container = hidden ? container.target : container
      if (shadowRef && container.scrollTop > 0) {
        // @ts-ignore
        if (!shadowRef.current.classList.contains('scrolled')) {
          // @ts-ignore
          shadowRef.current.classList.add('scrolled')
        }
      } else {
        // @ts-ignore
        shadowRef.current.classList.remove('scrolled')
      }
    }
  }

  // ** filterMenu
  const handleSearch = (e) => {
    const term = e.target.value;
    
    if (term === '') {
      setFilteredMenu(menu)
      setOpenFolders([])
    }
    else {
      const [filteredChildren, updatedActiveGroups] = filterMenu(menu, term);
      setFilteredMenu(filteredChildren)
    }
  };

  // const filterMenu = (items, term, newActiveGroups = []) => {

  //   const filtered = items.map((item) => {
  //     if (item.children) {
  //       // Recursively filter children
  //       const [filteredChildren, updatedActiveGroups] = filterMenu(item.children, term, newActiveGroups);

  //       // Keep the folder if any of its children match the search term
  //       if (filteredChildren.length > 0) {
  //         if (!newActiveGroups.includes(item.id)) {
  //           newActiveGroups.push(item.id);
  //         }

  //         return {
  //           ...item,
  //           children: filteredChildren,
  //         };
  //       }
  //     }

  //     // Check if the item's title includes the search term
  //     if (item.title.toLowerCase().includes(term.toLowerCase())) {
  //       if (item.children && item.children.length > 0 && !newActiveGroups.includes(item.id)) {
  //         newActiveGroups.push(item.id);
  //       }

  //       return item;
  //     }

  //     return null;
  //   });

  //   // Remove null values and return filtered items
  //   const filteredItems = filtered.filter((item) => item !== null);

  //   return [filteredItems, newActiveGroups];
  // };

  const filterMenu = (items, term) => {

    const filteredItems = items.map((item) => {
      if (item.children) {
        const [filteredChildren, hasMatchingChild] = filterMenu(item.children, term)
        if (filteredChildren.length > 0 || hasMatchingChild) {
          setOpenFolders(prevState => {
            return [...prevState, item.id]
          })

          return {
            ...item,
            children: filteredChildren,
            isOpen: true, // Open folders with matching children
          };
        }
      }
      const isMatch = item.title.toLowerCase().includes(term.toLowerCase())

      return isMatch ? { ...item, isOpen: true } : null;
    })

    const filteredItemsWithoutNull = filteredItems.filter((item) => item !== null)
    const hasMatchingItem = filteredItemsWithoutNull.some((item) => item.isOpen)

    return [filteredItemsWithoutNull, hasMatchingItem]
  };

  const filterFav = (menu) => {
    const iconName = "FavIcon"; 
    const favorites = [];
  
    const traverse = (items) => {
      items?.forEach(item => {
        if (item?.children && item?.children?.length > 0) {
          traverse(item?.children);
        } else {
          if(item?.iconName === iconName){
            favorites?.push(item);
          }
        }
      });
    };
    traverse(menu);

    return favorites;
  };

  useEffect(() => {
    setFilteredMenu(props.verticalNavItems)
  }, [props.verticalNavItems])

  // useEffect(() => {
  //   if (navCollapsed)
  //     setOpenFolders([])
  // }, [navCollapsed])

  const ScrollWrapper = hidden ? Box : PerfectScrollbar

  return (
    <ThemeProvider theme={darkTheme}>
      <Drawer {...props}>
        <VerticalNavHeader   
          isArabic={isArabic}
          {...props} 
        />
        {beforeNavMenuContent && beforeVerticalNavMenuContentPosition === 'fixed'
          ? beforeNavMenuContent(navMenuContentProps)
          : null}
        {(beforeVerticalNavMenuContentPosition === 'static' || !beforeNavMenuContent) && (
          <StyledBoxForShadow ref={shadowRef} />
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', px: 4, pb:'10px' }}>
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            size="small"
            onChange={handleSearch}
            autoComplete='off'
            InputLabelProps={{
              sx: { color: 'rgba(231, 227, 252, 0.87) !important',backgroundColor:'#383838',padding:'0px 3px !important',
              display:  navCollapsed ? 'none':'flex',},
            }}
            InputProps={{
              sx: { 
                display: 'flex',
                alignItems: navCollapsed ? 'center !important' : 'left',
                justifyContent: navCollapsed ? 'center !important' : 'left',
                border: '1px solid rgba(231, 227, 252, 0.87)',
                fieldset: {
                  borderColor: 'transparent !important', },},
              endAdornment: <SearchIcon 
              sx={{ border: '0px' }}  />,
            }}
          />
          <TextField sx={{display:'none'}}/>
           <Dropdown
            Image={<SettingsIcon />}
            TooltipTitle="Gear Items"
            onClickAction={(GearItem) => {
              router.push(GearItem?.path);
              setLastOpenedPage(GearItem);
            }}
            map={gear.gear}
            navCollapsed={navCollapsed}
          />
          {filterFav(menu) && filterFav(menu).length > 0 &&(
            <Dropdown
              Image={ <GradeIcon style={{ color: 'yellow' }}/>}
              TooltipTitle="Favorite Items"
              onClickAction={(favorite) => {
                router.push(favorite?.path);
                setLastOpenedPage(favorite);
              }}
              map={filterFav(menu)}
              navCollapsed={navCollapsed}
            />
          )}
        </Box>
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          {/* @ts-ignore */}
          <ScrollWrapper
            {...(hidden
              ? {
                onScroll: container => scrollMenu(container),
                sx: { height: '100%', overflowY: 'auto', overflowX: 'hidden' }
              }
              : {
                options: { wheelPropagation: false },
                onScrollY: container => scrollMenu(container),
                containerRef: ref => handleInfiniteScroll(ref)
              })}
          >
            {beforeNavMenuContent && beforeVerticalNavMenuContentPosition === 'static'
              ? beforeNavMenuContent(navMenuContentProps)
              : null}
            {userNavMenuContent ? (
              userNavMenuContent(navMenuContentProps)
            ) : (
              <List
                className='nav-items'
                sx={{
                  pt: 0,
                  transition: 'padding .25s ease',
                  '& > :first-child': { mt: '0' },

                  // pr: !navCollapsed || (navCollapsed && navHover) ? '10px' : 1.25

                }}
              >
                <VerticalNavItems
                  navCollapsed={navCollapsed}
                  currentActiveGroup={currentActiveGroup}
                  setCurrentActiveGroup={setCurrentActiveGroup}
                  openFolders={openFolders}
                  setOpenFolders={setOpenFolders}
                  {...props}
                  verticalNavItems={filteredMenu}
                  isArabic={isArabic}
                />
              </List>
            )}
            {afterNavMenuContent && afterVerticalNavMenuContentPosition === 'static'
              ? afterNavMenuContent(navMenuContentProps)
              : null}
          </ScrollWrapper>
        </Box>
        {afterNavMenuContent && afterVerticalNavMenuContentPosition === 'fixed'
          ? afterNavMenuContent(navMenuContentProps)
          : null}
      </Drawer>
    </ThemeProvider>
  )
}

export default Navigation
