// ** Next Imports
import Head from 'next/head'
import { Router } from 'next/router'

// ** Store Imports
import { store } from 'src/store'
import { Provider } from 'react-redux'

// ** Loader Import
import NProgress from 'nprogress'

// ** Emotion Imports
import { CacheProvider } from '@emotion/react'

// ** Config Imports
import 'src/configs/i18n'
import { defaultACLObj } from 'src/configs/acl'
import themeConfig from 'src/configs/themeConfig'

// ** Fake-DB Import
import 'src/@fake-db'

// ** Third Party Import
import { Toaster } from 'react-hot-toast'

// ** Component Imports
import UserLayout from 'src/layouts/UserLayout'
import AclGuard from 'src/@core/components/auth/AclGuard'
import ThemeComponent from 'src/@core/theme/ThemeComponent'
import AuthGuard from 'src/@core/components/auth/AuthGuard'
import GuestGuard from 'src/@core/components/auth/GuestGuard'

// ** Spinner Import
import Spinner from 'src/@core/components/spinner'

// ** Contexts
import { AuthContext, AuthProvider } from 'src/providers/AuthContext'
import { RequestsProvider } from 'src/providers/RequestsContext'
import { ControlProvider } from 'src/providers/ControlContext'
import { CommonProvider } from 'src/providers/CommonContext'
import { MenuProvider } from 'src/providers/MenuContext'
import { TabsProvider } from 'src/providers/TabsContext'
import { SettingsConsumer, SettingsProvider } from 'src/@core/context/settingsContext'
import { PrimeReactProvider } from 'primereact/api'

// ** Styled Components
import ReactHotToast from 'src/@core/styles/libs/react-hot-toast'

// ** Utils Imports
import { createEmotionCache } from 'src/@core/utils/create-emotion-cache'

// ** Prismjs Styles
import 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'

// ** React Perfect Scrollbar Style
import 'react-perfect-scrollbar/dist/css/styles.css'
import 'src/iconify-bundle/icons-bundle-react'

// ** PrimeReact Styles
import 'primereact/resources/primereact.min.css'
import 'primereact/resources/themes/saga-blue/theme.css'
import 'styles/globals.css'
import 'styles/formgrid.css'

// ** Global css styles
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WindowProvider } from 'src/windows'
import { ErrorProvider } from 'src/error'
import { useContext } from 'react'

const clientSideEmotionCache = createEmotionCache()

// ** Pace Loader
if (themeConfig.routingLoader) {
  Router.events.on('routeChangeStart', () => {
    NProgress.start()
  })
  Router.events.on('routeChangeError', () => {
    NProgress.done()
  })
  Router.events.on('routeChangeComplete', () => {
    NProgress.done()
  })
}

const Guard = ({ children, authGuard, guestGuard }) => {
  const { loading } = useContext(AuthContext)

  if (loading || guestGuard) {
    return <GuestGuard fallback={<Spinner />}>{children}</GuestGuard>
  } else if (!guestGuard && !authGuard) {
    return <>{children}</>
  } else {
    return <AuthGuard fallback={<Spinner />}>{children}</AuthGuard>
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false
    }
  }
})

// ** Configure JSS & ClassName
const App = props => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  // Variables
  const contentHeightFixed = Component.contentHeightFixed ?? false

  const getLayout =
    Component.getLayout ??
    (page => (
      <MenuProvider>
        <UserLayout contentHeightFixed={contentHeightFixed}>
          <TabsProvider pageTitle={Component.pageTitle ?? pageProps.pageTitle}>{page}</TabsProvider>
        </UserLayout>
      </MenuProvider>
    ))
  const setConfig = Component.setConfig ?? undefined
  const authGuard = Component.authGuard ?? true
  const guestGuard = Component.guestGuard ?? false
  const aclAbilities = Component.acl ?? defaultACLObj

  return (
    <Provider store={store}>
      <CacheProvider value={emotionCache}>
        <Head>
          <title>{`Argus ERP`}</title>
          <meta name='description' content={`Argus ERP`} />
          <meta name='keywords' content='Argus, ERP, ArgusERP' />
          <meta name='viewport' content='initial-scale=1, width=device-width' />
        </Head>
        <AuthProvider>
          <GuestGuard fallback={<Spinner />}>
            <RequestsProvider>
              <ErrorProvider>
                <WindowProvider>
                  <QueryClientProvider client={queryClient}>
                    <RequestsProvider>
                      <ControlProvider>
                        <CommonProvider>
                          <SettingsProvider {...(setConfig ? { pageSettings: setConfig() } : {})}>
                            <SettingsConsumer>
                              {({ settings }) => {
                                return (
                                  <ThemeComponent settings={settings}>
                                    <Guard authGuard={authGuard} guestGuard={guestGuard}>
                                      <AclGuard
                                        aclAbilities={aclAbilities}
                                        guestGuard={guestGuard}
                                        authGuard={authGuard}
                                      >
                                        <PrimeReactProvider>
                                          {getLayout(
                                            <ErrorProvider
                                              key={typeof window !== 'undefined' ? window.location.pathname : ''}
                                            >
                                              <RequestsProvider
                                                showLoading
                                                key={typeof window !== 'undefined' ? window.location.pathname : ''}
                                              >
                                                <CommonProvider
                                                  key={typeof window !== 'undefined' ? window.location.pathname : ''}
                                                >
                                                  <WindowProvider
                                                    key={typeof window !== 'undefined' ? window.location.pathname : ''}
                                                  >
                                                    <Component {...pageProps} />
                                                  </WindowProvider>
                                                </CommonProvider>
                                              </RequestsProvider>
                                            </ErrorProvider>
                                          )}
                                        </PrimeReactProvider>
                                      </AclGuard>
                                    </Guard>
                                    <ReactHotToast>
                                      <Toaster
                                        position={settings.toastPosition}
                                        toastOptions={{ className: 'react-hot-toast' }}
                                      />
                                    </ReactHotToast>
                                  </ThemeComponent>
                                )
                              }}
                            </SettingsConsumer>
                          </SettingsProvider>
                        </CommonProvider>
                      </ControlProvider>
                    </RequestsProvider>
                  </QueryClientProvider>
                </WindowProvider>
              </ErrorProvider>
            </RequestsProvider>
          </GuestGuard>
        </AuthProvider>
      </CacheProvider>
    </Provider>
  )
}

export default App
