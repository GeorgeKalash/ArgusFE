import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'
import jwt from 'jwt-decode'
import { AuthContext } from 'src/providers/AuthContext'
import { useError } from 'src/error'
import { Box, CircularProgress } from '@mui/material'
import { debounce } from 'lodash'

const RequestsContext = createContext()

function LoadingOverlay() {
  return (
    <Box
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
  const [loading, setLoading] = useState(false)

  let isRefreshingToken = false
  let tokenRefreshQueue = []

  async function showError(props) {
    if (errorModel) await errorModel.stack(props)
  }

  const debouncedCloseLoading = debounce(() => {
    setLoading(false)
  }, 500)

  const getRequest = async body => {
    const accessToken = await getAccessToken()
    const disableLoading = body.disableLoading || false
    !disableLoading && !loading && setLoading(true)

    const throwError = body.throwError || false

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
          if (!disableLoading) debouncedCloseLoading()
          resolve(response.data)
        })
        .catch(error => {
          debouncedCloseLoading()
          showError({
            message: error,
            height: error.response?.status === 404 || error.response?.status === 500 ? 400 : ''
          })
          if (throwError) reject(error)
        })
    })
  }

  const getRequestFullEndPoint = async body => {
    const disableLoading = body.disableLoading || false
    !disableLoading && !loading && setLoading(true)

    const throwError = body.throwError || false

    return new Promise(async (resolve, reject) => {
      axios({
        method: 'GET',
        url: body.endPoint,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(response => {
          if (!disableLoading) debouncedCloseLoading()
          resolve(response.data)
        })
        .catch(error => {
          debouncedCloseLoading()
          showError({
            message: error,
            height: error.response?.status === 404 || error.response?.status === 500 ? 400 : ''
          })
          if (throwError) reject(error)
        })
    })
  }

  const getMicroRequest = async body => {
    const disableLoading = body.disableLoading || false
    !disableLoading && !loading && setLoading(true)

    const throwError = body.throwError || false

    return new Promise(async (resolve, reject) => {
      return axios({
        method: 'GET',
        url: process.env.NEXT_PUBLIC_YAKEEN_URL + body.extension + '?' + body.parameters
      })
        .then(response => {
          if (!disableLoading) debouncedCloseLoading()
          resolve(response.data)
        })
        .catch(error => {
          debouncedCloseLoading()
          showError({
            message: error,
            height: error.response?.status === 404 || error.response?.status === 500 ? 400 : ''
          })
          if (throwError) reject(error)
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
        LanguageId: user.languageId
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

  const postRequest = async body => {
    !loading && setLoading(true)

    const accessToken = await getAccessToken()
    const url = body.url ? body.url : apiUrl

    var bodyFormData = new FormData()
    bodyFormData.append('record', body.record)
    body?.file && bodyFormData.append('file', body.file)
    body?.files &&
      body?.files.forEach(file => {
        bodyFormData.append('file', file.file)
      })
    const disableLoading = body.disableLoading || false
    !disableLoading && !loading && setLoading(true)

    const throwError = body.throwError || false

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
          if (!disableLoading) {
            debouncedCloseLoading()
          }
          resolve(response.data)
        })
        .catch(error => {
          debouncedCloseLoading()
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
    getMicroRequest,
    getRequestFullEndPoint
  }

  return (
    <>
      <RequestsContext.Provider value={values}>{children}</RequestsContext.Provider>
      {showLoading && loading && <LoadingOverlay />}
    </>
  )
}

export { RequestsContext, RequestsProvider }
