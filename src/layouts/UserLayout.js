import { useContext } from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import Layout from 'src/@core/layouts/Layout'
import { useSettings } from 'src/@core/hooks/useSettings'
import { MenuContext } from 'src/providers/MenuContext'

const UserLayout = ({ children, contentHeightFixed }) => {
  const { settings, saveSettings } = useSettings()
  const { menu } = useContext(MenuContext)

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
