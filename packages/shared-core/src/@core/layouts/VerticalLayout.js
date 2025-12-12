import { useState } from 'react'
import Fab from '@mui/material/Fab'
import { styled } from '@mui/material/styles'
import Box from '@mui/material/Box'
import Icon from '@argus/shared-core/src/@core/components/icon'
import themeConfig from '@argus/shared-configs/src/configs/themeConfig'
import AppBar from './components/vertical/appBar'
import Customizer from '@argus/shared-core/src/@core/components/customizer'
import Navigation from './components/vertical/navigation'
import ScrollToTop from '@argus/shared-core/src/@core/components/scroll-to-top'

const VerticalLayoutWrapper = styled('div')({
  height: '100%',
  display: 'flex'
})

const MainContentWrapper = styled(Box)({
  flexGrow: 1,
  minWidth: 0,
  display: 'flex',
  minHeight: '100vh',
  flexDirection: 'column'
})

const ContentWrapper = styled('main')(({ theme }) => ({
  flexGrow: 1,
  width: '100%',
  height: '100vh',
  display: 'flex',
  flexDirection: 'column'
}))

const VerticalLayout = props => {
  const { hidden, settings, children, scrollToTop, contentHeightFixed, verticalLayoutProps } = props
  const { skin, navHidden, contentWidth } = settings
  const { navigationSize, disableCustomizer, collapsedNavigationSize } = themeConfig
  const navWidth = navigationSize
  const navigationBorderWidth = skin === 'bordered' ? 1 : 0
  const collapsedNavWidth = collapsedNavigationSize
  const [navVisible, setNavVisible] = useState(false)
  const toggleNavVisibility = () => setNavVisible(!navVisible)

  return (
    <>
      <VerticalLayoutWrapper className='layout-wrapper'>
        {/* Navigation Menu */}
        {navHidden && !(navHidden && settings.lastLayout === 'horizontal') ? null : (
          <Navigation
            navWidth={navWidth}
            navVisible={navVisible}
            setNavVisible={setNavVisible}
            collapsedNavWidth={collapsedNavWidth}
            toggleNavVisibility={toggleNavVisibility}
            navigationBorderWidth={navigationBorderWidth}
            navMenuContent={verticalLayoutProps.navMenu.content}
            navMenuBranding={verticalLayoutProps.navMenu.branding}
            menuLockedIcon={verticalLayoutProps.navMenu.lockedIcon}
            verticalNavItems={verticalLayoutProps.navMenu.navItems}
            navMenuProps={verticalLayoutProps.navMenu.componentProps}
            menuUnlockedIcon={verticalLayoutProps.navMenu.unlockedIcon}
            afterNavMenuContent={verticalLayoutProps.navMenu.afterContent}
            beforeNavMenuContent={verticalLayoutProps.navMenu.beforeContent}
            {...props}
          />
        )}
        <MainContentWrapper className='layout-content-wrapper' sx={{ ...contentHeightFixed }}>
          <AppBar
            toggleNavVisibility={toggleNavVisibility}
            appBarContent={verticalLayoutProps.appBar?.content}
            appBarProps={verticalLayoutProps.appBar?.componentProps}
            {...props}
          />
          <ContentWrapper
            className='layout-page-content'
            sx={{
              ...(contentHeightFixed && {
                '& > :first-of-type': { height: '100%' }
              }),
              ...(contentWidth === 'boxed' && {
                mx: 'auto',
                '@media (min-width:1440px)': { maxWidth: 1440 },
                '@media (min-width:1200px)': { maxWidth: '100%' }
              })
            }}
          >
            {children}
          </ContentWrapper>
        </MainContentWrapper>
      </VerticalLayoutWrapper>
      {disableCustomizer || hidden ? null : <Customizer />}
      {scrollToTop ? (
        scrollToTop(props)
      ) : (
        <ScrollToTop className='mui-fixed'>
          <Fab color='primary' size='small' aria-label='scroll back to top'>
            <Icon icon='mdi:arrow-up' />
          </Fab>
        </ScrollToTop>
      )}
    </>
  )
}

export default VerticalLayout
