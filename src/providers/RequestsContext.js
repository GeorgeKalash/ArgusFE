// ** React Imports
import { createContext, useContext, useState } from 'react'

// ** 3rd Party Imports
import axios from 'axios'
import jwt from 'jwt-decode'
import { AuthContext } from 'src/providers/AuthContext'
import { useError } from 'src/error'
import { Box, CircularProgress } from '@mui/material'

const RequestsContext = createContext()

const RequestsProvider = ({ children }) => {
  const { user, setUser, apiUrl } = useContext(AuthContext)
  const { stack: stackError } = useError() || {}
  const [loading, setLoading] = useState(0)

  let isRefreshingToken = false
  let tokenRefreshQueue = []

  const getRequest = async body => {
    const accessToken = await getAccessToken()

    setLoading(true)

    return axios({
      method: 'GET',
      url: apiUrl + body.extension + '?' + body.parameters,
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'multipart/form-data',
        LanguageId: user.languageId
      }
    })
      .then(res => {
        setInterval(setLoading(false), 1000)

        return res.data
      })
      .catch(error => {
        setInterval(setLoading(false), 1000)
        stackError({ message: error, height: 400 })
        throw error
      })
  }

  const getMicroRequest = async body => {
    const accessToken = await getAccessToken()

    return axios({
      method: 'GET',
      url: process.env.NEXT_PUBLIC_YAKEEN_URL + body.extension + '?' + body.parameters
    })
      .then(res => res.data)
      .catch(error => {
        stackError({ message: error, height: 400 })
        throw error
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
        stackError({ message: error, height: 400 })
        throw error
      })
  }

  const postRequest = async body => {
    const accessToken = await getAccessToken()
    const url = body.url ? body.url : apiUrl

    var bodyFormData = new FormData()
    bodyFormData.append('record', body.record)

    return axios({
      method: 'POST',
      url: url + body.extension,
      headers: {
        Authorization: 'Bearer ' + accessToken,
        'Content-Type': 'multipart/form-data',
        LanguageId: user.languageId
      },
      data: bodyFormData
    })
      .then(res => res.data)
      .catch(error => {
        stackError({ message: error, height: 400 })
        throw error
      })
  }

  const getAccessToken = async () => {
    return new Promise(async resolve => {
      // Add a resolve function to the queue
      const resolveWrapper = token => {
        resolve(token)
      }
      tokenRefreshQueue.push(resolveWrapper)

      // If a token refresh is not in progress, initiate it
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
    getMicroRequest
  }

  return (
    <>
      <RequestsContext.Provider value={values}>{children}</RequestsContext.Provider>
      {loading && (
        <Box
          style={{
            position: 'absolute',
            top: 42,
            right: 0,
            width: '80%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.2)', // Semi-transparent black background
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999 // Ensure it's above other content
          }}
        >
          <CircularProgress color='success' />
        </Box>
      )}
    </>
  )
}

export { RequestsContext, RequestsProvider }
