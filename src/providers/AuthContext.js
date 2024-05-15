// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Config
import authConfig from 'src/configs/auth'

// ** Defaults
const defaultProvider = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}
const AuthContext = createContext(defaultProvider)

// ** 3rd Party Imports
import axios from 'axios'
import SHA1 from 'crypto-js/sha1'
import jwt from 'jwt-decode'

const encryptePWD = pwd => {
  var encryptedPWD = SHA1(pwd).toString()
  var shuffledString = ''

  for (let i = 0; i < encryptedPWD.length; i = i + 8) {
    var subString = encryptedPWD.slice(i, i + 8)

    shuffledString += subString.charAt(6) + subString.charAt(7)
    shuffledString += subString.charAt(4) + subString.charAt(5)
    shuffledString += subString.charAt(2) + subString.charAt(3)
    shuffledString += subString.charAt(0) + subString.charAt(1)
  }

  return shuffledString.toUpperCase()
}

const AuthProvider = ({ children }) => {
  // ** States
  const [user, setUser] = useState(defaultProvider.user)
  const [loading, setLoading] = useState(defaultProvider.loading)
  const [companyName, setCompanyName] = useState('')
  const [getAC, setGetAC] = useState({})

  // ** Hooks
  const router = useRouter()

  useEffect(() => {
    const initAuth = async () => {
      const userData = window.localStorage.getItem('userData')
        ? window.localStorage.getItem('userData')
        : window.sessionStorage.getItem('userData')

      if (userData) {
        setUser(JSON.parse(userData))
        setLoading(false)
      } else {
        setLoading(false)
      }
    }
    initAuth()

    const fetchData = async () => {
      const matchHostname = window.location.hostname.match(/^(.+)\.softmachine\.co$/)

      const accountName = matchHostname ? matchHostname[1] : 'byc-deploy'



      try {
        const response = await axios({
          method: 'GET',
          url: `${process.env.NEXT_PUBLIC_AuthURL}/MA.asmx/getAC?_accountName=${accountName}`
        })

        // Set companyName from the API response
        setCompanyName(response.data.record.companyName)
        setGetAC(response)
        window.localStorage.setItem('apiUrl', response.data.record.api)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  const handleLogin = async (params, errorCallback) => {
    try {
      const getUS2 = await axios({
        method: 'GET',
        url: `${getAC.data.record.api}/SY.asmx/getUS2?_email=${params.username}`,
        headers: {
          accountId: JSON.parse(getAC.data.record.accountId),
          dbe: JSON.parse(getAC.data.record.dbe),
          dbs: JSON.parse(getAC.data.record.dbs)
        }
      })

      if (getUS2.data.record === null) {
        throw new Error(`User ${params.username} not found`)
      }

      const signIn3Params = `_email=${params.username}&_password=${encryptePWD(params.password)}&_accountId=${
        getAC.data.record.accountId
      }&_userId=${getUS2.data.record.recordId}`

      const signIn3 = await axios({
        method: 'GET',
        url: `${process.env.NEXT_PUBLIC_AuthURL}/MA.asmx/signIn3?${signIn3Params}`,
        headers: {
          accountId: JSON.parse(getAC.data.record.accountId),
          dbe: JSON.parse(getAC.data.record.dbe),
          dbs: JSON.parse(getAC.data.record.dbs)
        }
      })

      const defaultSettings = await axios({
        method: 'GET',
        url: `${getAC.data.record.api}/SY.asmx/getDE?_key=dateFormat`,
        headers: {
          Authorization: 'Bearer ' + signIn3.data.record.accessToken,
          'Content-Type': 'multipart/form-data'
        }
      })

      const defaultSet = {
        dateFormat: defaultSettings.data.record.value ? defaultSettings.data.record.value : 'dd/MM/yyyy'
      }

      window.localStorage.setItem('default', JSON.stringify(defaultSet))

      const loggedUser = {
        accountId: getAC.data.record.accountId,
        userId: getUS2.data.record.recordId,
        username: getUS2.data.record.username,
        languageId: getUS2.data.record.languageId,
        userType: getUS2.data.record.userType,
        employeeId: getUS2.data.record.employeeId,
        fullName: getUS2.data.record.fullName,
        role: 'admin',
        username: getUS2.data.record.fullName,
        id: 1,
        expiresAt: jwt(signIn3.data.record.accessToken).exp,
        ...signIn3.data.record
      }

      setUser({ ...loggedUser })

      params.rememberMe
        ? window.localStorage.setItem('userData', JSON.stringify(loggedUser))
        : window.sessionStorage.setItem('userData', JSON.stringify(loggedUser))

      const returnUrl = router.query.returnUrl
      const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
      router.replace(redirectURL)
    } catch (error) {
      console.log({ logError: error })
      if (errorCallback) errorCallback(error)
    }
  }

  const handleLogout = () => {
    setUser(null)
    window.localStorage.removeItem('userData')
    window.sessionStorage.removeItem('userData')

    router.push('/login')
  }

  const getAccessToken = async () => {
    return new Promise(resolve => {
      if (user.expiresAt !== null) {
        var dateNow = new Date()

        if (user.expiresAt < Math.trunc(dateNow.getTime() / 1000)) {
          var bodyFormData = new FormData()
          bodyFormData.append(
            'record',
            JSON.stringify({ accessToken: user.accessToken, refreshToken: user.refreshToken })
          )

          return axios({
            method: 'POST',
            url: process.env.NEXT_PUBLIC_AuthURL + 'MA.asmx/' + 'newAT',
            headers: {
              authorization: 'Bearer ' + user.accessToken,
              'Content-Type': 'multipart/form-data'
            },
            data: bodyFormData
          })
            .then(res => {
              let newUser = {
                ...user,
                accessToken: res.data.record.accessToken,
                refreshToken: res.data.record.refreshToken,
                expiresAt: jwt(res.data.record.accessToken).exp
              }

              if (window.localStorage.getItem('userData'))
                window.localStorage.setItem('userData', JSON.stringify(newUser))
              else window.sessionStorage.setItem('userData', JSON.stringify(newUser))

              resolve(res.data.record.accessToken)
            })
            .catch(() => {
              resolve('error getting new Access Token')
            })
        } else resolve(user.accessToken)
      } else resolve(null)
    })
  }

  const values = {
    user,
    loading,
    companyName,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
    getAccessToken,
    apiUrl: getAC?.data?.record.api || (typeof window !== 'undefined' ? window.localStorage.getItem('apiUrl') : '')
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
