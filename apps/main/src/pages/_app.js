import Head from 'next/head'
import { Router } from 'next/router'
import UserLayout from '@argus/shared-layouts/src/layouts/UserLayout'
import { store } from '@argus/shared-store/src/store'
import { Provider } from 'react-redux'
import NProgress from 'nprogress'
import { CacheProvider } from '@emotion/react'
import '@argus/shared-configs/src/configs/i18n'
import { defaultACLObj } from '@argus/shared-configs/src/configs/acl'
import themeConfig from '@argus/shared-configs/src/configs/themeConfig'
import { Toaster } from 'react-hot-toast'
import AclGuard from '@argus/shared-core/src/@core/components/auth/AclGuard'
import ThemeComponent from '@argus/shared-core/src/@core/theme/ThemeComponent'
import AuthGuard from '@argus/shared-core/src/@core/components/auth/AuthGuard'
import GuestGuard from '@argus/shared-core/src/@core/components/auth/GuestGuard'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import 'ag-grid-community'
import Spinner from '@argus/shared-core/src/@core/components/spinner'
import { AuthContext, AuthProvider } from '@argus/shared-providers/src/providers/AuthContext'
import { RequestsProvider } from '@argus/shared-providers/src/providers/RequestsContext'
import { ControlProvider } from '@argus/shared-providers/src/providers/ControlContext'
import { CommonProvider } from '@argus/shared-providers/src/providers/CommonContext'
import { MenuProvider } from '@argus/shared-providers/src/providers/MenuContext'
import { TabsProvider } from '@argus/shared-providers/src/providers/TabsContext'
import { SettingsConsumer, SettingsProvider } from '@argus/shared-core/src/@core/context/settingsContext'
import { PrimeReactProvider } from 'primereact/api'
import ReactHotToast from '@argus/shared-core/src/@core/styles/libs/react-hot-toast'
import { createEmotionCache } from '@argus/shared-core/src/@core/utils/create-emotion-cache'
import 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-tsx'
import 'react-perfect-scrollbar/dist/css/styles.css'
import '../iconify-bundle/icons-bundle-react'
import 'primereact/resources/primereact.min.css'
import 'primereact/resources/themes/saga-blue/theme.css'
import '@argus/shared-ui/src/components/styles/globals.css'
import '@argus/shared-ui/src/components/styles/formgrid.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WindowProvider } from '@argus/shared-providers/src/providers/windows'
import { ErrorProvider } from '@argus/shared-providers/src/providers/error'
import { useContext } from 'react'
import { LabelsAccessContextProvider } from '@argus/shared-providers/src/providers/LabelsAccessContext'
import { LockedScreensProvider } from '@argus/shared-providers/src/providers/LockedScreensContext'
import GlobalErrorHandlers from '@argus/shared-providers/src/providers/GlobalErrorHandlers'
import RootBoundary from '@argus/shared-ui/src/components/Shared/RootBoundary'
import { DefaultsProvider } from '@argus/shared-providers/src/providers/DefaultsContext'

const clientSideEmotionCache = createEmotionCache()

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

function CachedDefaults({ children }) {
  const { user, loading } = useContext(AuthContext)
  if (loading) return null

  if (!user) return children

  return <DefaultsProvider>{children}</DefaultsProvider>
}

const App = props => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

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
          <meta name='google' content='notranslate' />
        </Head>
        <AuthProvider>
          <GlobalErrorHandlers />
          <GuestGuard fallback={<Spinner />}>
            <RequestsProvider>
              <CachedDefaults>
                <ErrorProvider>
                  <WindowProvider>
                    <LockedScreensProvider>
                      <QueryClientProvider client={queryClient}>
                        <LabelsAccessContextProvider>
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
                                                  <RootBoundary
                                                    resetKey={
                                                      typeof window !== 'undefined' ? window.location.pathname : ''
                                                    }
                                                  >
                                                    <ErrorProvider
                                                      key={
                                                        typeof window !== 'undefined' ? window.location.pathname : ''
                                                      }
                                                    >
                                                      <RequestsProvider
                                                        showLoading
                                                        key={
                                                          typeof window !== 'undefined' ? window.location.pathname : ''
                                                        }
                                                      >
                                                        <CommonProvider
                                                          key={
                                                            typeof window !== 'undefined'
                                                              ? window.location.pathname
                                                              : ''
                                                          }
                                                        >
                                                          <ControlProvider
                                                            key={
                                                              typeof window !== 'undefined'
                                                                ? window.location.pathname
                                                                : ''
                                                            }
                                                          >
                                                            <WindowProvider
                                                              key={
                                                                typeof window !== 'undefined'
                                                                  ? window.location.pathname
                                                                  : ''
                                                              }
                                                            >
                                                              <Component {...pageProps} />
                                                            </WindowProvider>
                                                          </ControlProvider>
                                                        </CommonProvider>
                                                      </RequestsProvider>
                                                    </ErrorProvider>
                                                  </RootBoundary>
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
                        </LabelsAccessContextProvider>
                      </QueryClientProvider>
                    </LockedScreensProvider>
                  </WindowProvider>
                </ErrorProvider>
              </CachedDefaults>
            </RequestsProvider>
          </GuestGuard>
        </AuthProvider>
      </CacheProvider>
    </Provider>
  )
}

export default App
