import { useContext } from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import Layout from 'src/@core/layouts/Layout'

// ** Component Import
// Uncomment the below line (according to the layout type) when using server-side menu
// import ServerSideVerticalNavItems from './components/vertical/ServerSideNavItems'
// import ServerSideHorizontalNavItems from './components/horizontal/ServerSideNavItems'

import { useSettings } from 'src/@core/hooks/useSettings'
import { MenuContext } from 'src/providers/MenuContext'

const UserLayout = ({ children, contentHeightFixed }) => {
  const { settings, saveSettings } = useSettings()
  const { menu } = useContext(MenuContext)

  // ** Vars for server side navigation
  // const { menuItems: verticalMenuItems } = ServerSideVerticalNavItems()
  // const { menuItems: horizontalMenuItems } = ServerSideHorizontalNavItems()
  /**
   *  The below variable will hide the current layout menu at given screen size.
   *  The menu will be accessible from the Hamburger icon only (Vertical Overlay Menu).
   *  You can change the screen size from which you want to hide the current layout menu.
   *  Please refer useMediaQuery() hook: https://mui.com/material-ui/react-use-media-query/,
   *  to know more about what values can be passed to this hook.
   *  ! Do not change this value unless you know what you are doing. It can break the template.
   */

  const hidden = useMediaQuery(theme => theme.breakpoints.down('sx'))
  if (hidden && settings.layout === 'horizontal') {
    settings.layout = 'vertical'
  }

  return (
    <Layout
      hidden={hidden}
      settings={settings}
      saveSettings={saveSettings}
      contentHeightFixed={contentHeightFixed}
      verticalLayoutProps={{
        navMenu: {
          navItems: menu
        }
      }}
    >
      {children}
    </Layout>
  )
}

export default UserLayout
