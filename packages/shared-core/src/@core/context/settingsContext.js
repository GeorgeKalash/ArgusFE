// ** React Imports
import { createContext, useState, useEffect } from 'react'

// ** ThemeConfig Import
import themeConfig from '@argus/shared-configs/src/configs/themeConfig'

// ** Hooks
import { useAuth } from '@argus/shared-hooks/src/hooks/useAuth'
import { useTranslation } from 'react-i18next'

const initialSettings = {
  themeColor: 'primary',
  mode: themeConfig.mode,
  skin: themeConfig.skin,
  footer: themeConfig.footer,
  layout: themeConfig.layout,
  lastLayout: themeConfig.layout,
  direction: themeConfig.direction,
  navHidden: themeConfig.navHidden,
  appBarBlur: themeConfig.appBarBlur,
  navCollapsed: themeConfig.navCollapsed,
  contentWidth: themeConfig.contentWidth,
  toastPosition: themeConfig.toastPosition,
  verticalNavToggleType: themeConfig.verticalNavToggleType,
  appBar: themeConfig.layout === 'horizontal' && themeConfig.appBar === 'hidden' ? 'fixed' : themeConfig.appBar
}

const staticSettings = {
  appBar: initialSettings.appBar,
  footer: initialSettings.footer,
  layout: initialSettings.layout,
  navHidden: initialSettings.navHidden,
  lastLayout: initialSettings.lastLayout,
  toastPosition: initialSettings.toastPosition
}

const restoreSettings = () => {
  let settings = null
  try {
    const storedData = window.localStorage.getItem('settings')
    if (storedData) {
      settings = { ...JSON.parse(storedData), ...staticSettings }
    } else {
      settings = initialSettings
    }
  } catch (err) {
    console.error(err)
  }

  return settings
}

// set settings in localStorage
const storeSettings = settings => {
  const initSettings = Object.assign({}, settings)
  delete initSettings.appBar
  delete initSettings.footer
  delete initSettings.layout
  delete initSettings.navHidden
  delete initSettings.lastLayout
  delete initSettings.toastPosition
  window.localStorage.setItem('settings', JSON.stringify(initSettings))
}

// ** Create Context
export const SettingsContext = createContext({
  saveSettings: () => null,
  settings: initialSettings
})

export const SettingsProvider = ({ children, pageSettings }) => {
  // ** State
  const [settings, setSettings] = useState({ ...initialSettings })
  const { i18n } = useTranslation()

  const auth = useAuth()

  useEffect(() => {
    const restoredSettings = restoreSettings()
    if (restoredSettings) {
      setSettings({ ...restoredSettings })
    }
    if (pageSettings) {
      setSettings({ ...settings, ...pageSettings })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageSettings])

  useEffect(() => {
    if (settings.layout === 'horizontal' && settings.mode === 'semi-dark') {
      saveSettings({ ...settings, mode: 'light' })
    }
    if (settings.layout === 'horizontal' && settings.appBar === 'hidden') {
      saveSettings({ ...settings, appBar: 'fixed' })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.layout])

  useEffect(() => {
    switch (auth?.user?.languageId) {
      case 1:
        i18n.changeLanguage('en')
        saveSettings({ ...settings, direction: 'ltr' })
        break
      case 2:
        i18n.changeLanguage('ar')
        saveSettings({ ...settings, direction: 'rtl' })
        break
      case 3:
        i18n.changeLanguage('fr')
        saveSettings({ ...settings, direction: 'ltr' })
        break

      default:
        break
    }
  }, [auth.user])

  const saveSettings = updatedSettings => {
    storeSettings(updatedSettings)
    setSettings(updatedSettings)
  }

  return <SettingsContext.Provider value={{ settings, saveSettings }}>{children}</SettingsContext.Provider>
}

export const SettingsConsumer = SettingsContext.Consumer
