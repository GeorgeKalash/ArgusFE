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
  settings: initialSettings,
  setTempLanguageId: () => null
})

export const SettingsProvider = ({ children, pageSettings }) => {
  const auth = useAuth()
  const { i18n } = useTranslation()
  const [settings, setSettings] = useState(initialSettings)
  const [tempLanguageId, setTempLanguageId] = useState(auth?.user?.languageId || 1)

  const languageMap = {
    1: { code: 'en', direction: 'ltr' },
    2: { code: 'ar', direction: 'rtl' },
    3: { code: 'fr', direction: 'ltr' }
  }

  useEffect(() => {
    const restoredSettings = restoreSettings()

    if (restoredSettings) {
      setSettings(prev => ({
        ...prev,
        ...restoredSettings,
        ...(pageSettings || {})
      }))
    }
  }, [pageSettings])

  useEffect(() => {
    if (settings.layout === 'horizontal') {
      if (settings.mode === 'semi-dark') {
        saveSettings({
          ...settings,
          mode: 'light'
        })
      }

      if (settings.appBar === 'hidden') {
        saveSettings({
          ...settings,
          appBar: 'fixed'
        })
      }
    }
  }, [settings.layout])

  useEffect(() => {
    if (auth?.user?.languageId) {
      setTempLanguageId(auth.user.languageId)
    }
  }, [auth?.user?.languageId])

  useEffect(() => {
    changeLanguage(tempLanguageId)
  }, [tempLanguageId])

  const changeLanguage = async languageId => {
    const language = languageMap[languageId]

    if (!language) return

    await i18n.changeLanguage(language.code)

    document.documentElement.lang = language.code
    document.documentElement.dir = language.direction

    document.body.lang = language.code
    document.body.dir = language.direction

    setSettings(prev => {
      const updated = {
        ...prev,
        direction: language.direction
      }

      storeSettings(updated)

      return updated
    })
  }
  
  const saveSettings = updatedSettings => {
    storeSettings(updatedSettings)
    setSettings(updatedSettings)
  }

  return (
    <SettingsContext.Provider
      value={{
        settings,
        saveSettings,
        changeLanguage,
        tempLanguageId,
        setTempLanguageId,
        direction: settings.direction,
        languageId: tempLanguageId
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export const SettingsConsumer = SettingsContext.Consumer
