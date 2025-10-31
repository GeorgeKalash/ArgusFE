import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import jwt from 'jwt-decode'
import { AuthContext } from 'src/providers/AuthContext'
import { useError } from 'src/error'
import { Box, CircularProgress } from '@mui/material'
import { useSettings } from 'src/@core/hooks/useSettings'

const RequestsContext = createContext()

function LoadingOverlay() {
  const { settings } = useSettings()
  const { navCollapsed } = settings
  const containerWidth = `calc(calc(100 * var(--vw)) - ${navCollapsed ? '10px' : '310px'})`
  const containerHeight = `calc(calc(100 * var(--vh)) - 40px)`

  return (
    <Box
      sx={{
        position: 'fixed',
        width: containerWidth,
        height: containerHeight,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        zIndex: 9999
      }}
    >
      <CircularProgress color='inherit' />
    </Box>
  )
}

const RequestsProvider = ({ showLoading = false, children }) => {
  const { user, setUser, apiUrl } = useContext(AuthContext)
  const errorModel = useError()
  const [activeRequests, setActiveRequests] = useState(0)

  let isRefreshingToken = false
  let tokenRefreshQueue = []

  async function showError(props) {
    if (errorModel) await errorModel.stack(props)
  }

  const incrementRequests = () => {
    setActiveRequests(prev => prev + 1)
  }

  const decrementRequests = () => {
    setActiveRequests(prev => prev - 1)
  }

  const getRequest = async body => {
    const accessToken = await getAccessToken()
    const disableLoading = body.disableLoading || false

    const throwError = body.throwError || false

    if (!disableLoading) incrementRequests()

    return new Promise(async (resolve, reject) => {
      axios({
        method: 'GET',
        url: apiUrl + body.extension + '?' + body.parameters,
        headers: {
          Authorization: 'Bearer ' + accessToken,
          'Content-Type': 'multipart/form-data',
          LanguageId: user?.languageId
        }
      })
        .then(response => {
          resolve(response.data)
        })
        .catch(error => {
          showError({
            message: error,
            height: error.response?.status === 404 || error.response?.status === 500 ? 400 : ''
          })

          if (throwError) reject(error)
          else if (error.response?.status) resolve(error)
        })
        .finally(() => {
          if (!disableLoading) decrementRequests()
        })
    })
  }

  const getRequestFullEndPoint = async body => {
    const disableLoading = body.disableLoading || false

    const throwError = body.throwError || false

    if (!disableLoading) incrementRequests()

    return new Promise(async (resolve, reject) => {
      axios({
        method: 'GET',
        url: body.endPoint,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(response => {
          resolve(response.data)
        })
        .catch(error => {
          showError({
            message: error,
            height: error.response?.status === 404 || error.response?.status === 500 ? 400 : ''
          })
          if (throwError) reject(error)
        })
        .finally(() => {
          if (!disableLoading) decrementRequests()
        })
    })
  }

  const getMicroRequest = async body => {
    const disableLoading = body.disableLoading || false

    const throwError = body.throwError || false

    if (!disableLoading) incrementRequests()

    return new Promise(async (resolve, reject) => {
      return axios({
        method: 'GET',
        url: process.env.NEXT_PUBLIC_YAKEEN_URL + body.extension + '?' + body.parameters
      })
        .then(response => {
          resolve(response.data)
        })
        .catch(error => {
          showError({
            message: error,
            height: error.response?.status === 404 || error.response?.status === 500 ? 400 : ''
          })
          if (throwError) reject(error)
        })
        .finally(() => {
          if (!disableLoading) decrementRequests()
        })
    })
  }

  const getIdentityRequest = async body => {
    const accessToken = await getAccessToken()

    return axios({
      method: 'GET',
      url: process.env.NEXT_PUBLIC_AuthURL + body.extension + '?' + body.parameters,
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'multipart/form-data',
        LanguageId: user?.languageId || 1
      }
    })
      .then(res => res.data)
      .catch(error => {
        showError({
          message: error,
          height: error.response?.status === 404 || error.response?.status === 500 ? 400 : ''
        })
        throw error
      })
  }

  const postIdentityRequest = async body => {
    const accessToken = await getAccessToken()
    const token = accessToken ?? body.accessToken

    var bodyFormData = new FormData()
    bodyFormData.append('record', body.record)
    body?.file && bodyFormData.append('file', body.file)

    const throwError = body.throwError || false

    return new Promise(async (resolve, reject) => {
      axios({
        method: 'POST',
        url: process.env.NEXT_PUBLIC_AuthURL + body.extension,
        headers: {
          Authorization: 'Bearer ' + token,
          'Content-Type': 'multipart/form-data',
          LanguageId: user?.languageId || 1
        },
        data: bodyFormData
      })
        .then(response => {
          if (body?.noHandleError) return resolve(response.data)
          resolve(response.data)
        })
        .catch(error => {
          if (body?.noHandleError) {
            return resolve(error.response.data)
          }
          showError({
            message: error,
            height: error.response?.status === 404 || error.response?.status === 500 ? 400 : ''
          })

          if (throwError) reject(error)
        })
    })
  }

  const postRequest = async body => {
    const accessToken = await getAccessToken()
    const url = body.url ? body.url : apiUrl

    var bodyFormData = new FormData()
    bodyFormData.append('record', body.record)
    body?.file && bodyFormData.append('file', body.file)
    const disableLoading = body.disableLoading || false

    const throwError = body.throwError || false

    if (!disableLoading) incrementRequests()

    return new Promise(async (resolve, reject) => {
      axios({
        method: 'POST',
        url: url + body.extension,
        headers: {
          Authorization: 'Bearer ' + accessToken,
          'Content-Type': 'multipart/form-data',
          LanguageId: user.languageId
        },
        data: bodyFormData
      })
        .then(response => {
          if (!disableLoading) decrementRequests()

          if (body?.noHandleError) return resolve(response.data)
          resolve(response.data)
        })
        .catch(error => {
          if (!disableLoading) decrementRequests()

          if (body?.noHandleError) {
            return resolve(error.response.data)
          }
          showError({
            message: error,
            height: error.response?.status === 404 || error.response?.status === 500 ? 400 : ''
          })

          if (throwError) reject(error)
        })
    })
  }

  const getAccessToken = async () => {
    return new Promise(async resolve => {
      const resolveWrapper = token => {
        resolve(token)
      }
      tokenRefreshQueue.push(resolveWrapper)

      try {
        if (user?.expiresAt !== null) {
          var dateNow = new Date()

          if (user?.expiresAt < Math.trunc(dateNow.getTime() / 1000)) {
            if (!isRefreshingToken) {
              isRefreshingToken = true
              var bodyFormData = new FormData()
              bodyFormData.append(
                'record',
                JSON.stringify({ accessToken: user.accessToken, refreshToken: user.refreshToken })
              )

              const res = await axios({
                method: 'POST',
                url: process.env.NEXT_PUBLIC_AuthURL + 'MA.asmx/' + 'newAT',
                headers: {
                  authorization: 'Bearer ' + user.accessToken,
                  'Content-Type': 'multipart/form-data'
                },
                data: bodyFormData
              })

              let newUser = {
                ...user,
                accessToken: res.data.record.accessToken,
                refreshToken: res.data.record.refreshToken,
                expiresAt: jwt(res.data.record.accessToken).exp
              }

              setUser(newUser)
              if (window.localStorage.getItem('userData'))
                window.localStorage.setItem('userData', JSON.stringify(newUser))
              else window.sessionStorage.setItem('userData', JSON.stringify(newUser))

              // Resolve all pending requests in the queue with the new token
              tokenRefreshQueue.forEach(queuedResolve => {
                queuedResolve(res.data.record.accessToken)
              })

              // Clear the queue and reset the flag
              tokenRefreshQueue = []
              isRefreshingToken = false
            }
          } else {
            // If token is still valid, resolve all pending requests with the existing token
            tokenRefreshQueue.forEach(queuedResolve => {
              queuedResolve(user?.accessToken)
            })

            // Clear the queue and reset the flag
            tokenRefreshQueue = []
            isRefreshingToken = false
          }
        } else {
          // If no expiration information, resolve all pending requests with null
          tokenRefreshQueue.forEach(queuedResolve => {
            queuedResolve(null)
          })

          // Clear the queue and reset the flag
          tokenRefreshQueue = []
          isRefreshingToken = false
        }
      } catch (error) {
        // Handle error during token refresh
        tokenRefreshQueue.forEach(queuedResolve => {
          queuedResolve('error getting new Access Token')
        })

        // Clear the queue and reset the flag
        tokenRefreshQueue = []
        isRefreshingToken = false
      }
    })
  }

  const values = {
    getRequest,
    postRequest,
    getIdentityRequest,
    postIdentityRequest,
    getMicroRequest,
    getRequestFullEndPoint,
    LoadingOverlay,
    loading: activeRequests
  }

  return (
    <>
      <RequestsContext.Provider value={values}>{children}</RequestsContext.Provider>
      {showLoading && Boolean(activeRequests) && <LoadingOverlay />}
    </>
  )
}

export { RequestsContext, RequestsProvider }
