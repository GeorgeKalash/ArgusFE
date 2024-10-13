import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'

const defaultProvider = {
  user: null,
  loading: true,
  setUser: () => {},
  setLoading: () => {},
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}
const AuthContext = createContext(defaultProvider)
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
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [companyName, setCompanyName] = useState('')
  const [getAC, setGetAC] = useState({})
  const [languageId, setLanguageId] = useState(1)
  const router = useRouter()
  useEffect(() => {
    const initAuth = async () => {
      const userData = window.localStorage.getItem('userData') || window.sessionStorage.getItem('userData')
      const savedLanguageId = window.localStorage.getItem('languageId')
      if (userData) {
        setUser(JSON.parse(userData))
        if (savedLanguageId) {
          setLanguageId(parseInt(savedLanguageId))
        }
      } else {
        if (savedLanguageId) {
          setLanguageId(parseInt(savedLanguageId))
        }
      }
    }
    initAuth()

    const fetchData = async () => {
      const matchHostname = window.location.hostname.match(/^(.+)\.softmachine\.co$/)

      const accountName = matchHostname ? matchHostname[1] : 'gs-deploy'

      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_AuthURL}/MA.asmx/getAC?_accountName=${accountName}`)

        setCompanyName(response.data.record.companyName)
        setGetAC(response)
        window.localStorage.setItem('apiUrl', response.data.record.api)
      } catch (error) {
        console.error('Error fetching data:', error)
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const handleLogin = async (params, errorCallback) => {
    try {
      const getUS2 = await axios.get(`${getAC.data.record.api}/SY.asmx/getUS2?_email=${params.username}`, {
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

      const signIn3 = await axios.get(`${process.env.NEXT_PUBLIC_AuthURL}/MA.asmx/signIn3?${signIn3Params}`, {
        headers: {
          accountId: JSON.parse(getAC.data.record.accountId),
          dbe: JSON.parse(getAC.data.record.dbe),
          dbs: JSON.parse(getAC.data.record.dbs)
        }
      })

      const defaultSettings = await axios.get(`${getAC.data.record.api}/SY.asmx/getDE?_key=dateFormat`, {
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
        dashboardId: getUS2.data.record.dashboardId,
        role: 'admin',
        expiresAt: jwt(signIn3.data.record.accessToken).exp,
        ...signIn3.data.record
      }
      setLanguageId(loggedUser.languageId)
      window.localStorage.setItem('languageId', loggedUser.languageId)
      if (getUS2.data.record.umcpnl === true) {
        errorCallback({
          username: params.username,
          loggedUser,
          getUS2: getUS2.data.record
        })
      } else {
        setUser(loggedUser)
        window.sessionStorage.setItem('userData', JSON.stringify(loggedUser))
        const returnUrl = router.query.returnUrl
        const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
        router.replace(redirectURL)
      }
    } catch (error) {
      if (errorCallback) errorCallback(error)
    }
  }

  const handleLogout = async () => {
    setUser(null)
    window.localStorage.removeItem('userData')
    window.sessionStorage.removeItem('userData')
    await router.push('/login')
    router.reload()
  }

  const getAccessToken = async () => {
    return new Promise(resolve => {
      if (user && user.expiresAt !== null) {
        const dateNow = new Date()
        if (user.expiresAt < Math.trunc(dateNow.getTime() / 1000)) {
          const bodyFormData = new FormData()
          bodyFormData.append(
            'record',
            JSON.stringify({
              accessToken: user.accessToken,
              refreshToken: user.refreshToken
            })
          )
          axios
            .post(`${process.env.NEXT_PUBLIC_AuthURL}/MA.asmx/newAT`, bodyFormData, {
              headers: {
                authorization: 'Bearer ' + user.accessToken,
                'Content-Type': 'multipart/form-data'
              }
            })
            .then(res => {
              const newUser = {
                ...user,
                accessToken: res.data.record.accessToken,
                refreshToken: res.data.record.refreshToken,
                expiresAt: jwt(res.data.record.accessToken).exp
              }
              const storage = window.localStorage.getItem('userData') ? window.localStorage : window.sessionStorage
              storage.setItem('userData', JSON.stringify(newUser))
              resolve(res.data.record.accessToken)
            })
            .catch(() => resolve('error getting new Access Token'))
        } else {
          resolve(user.accessToken)
        }
      } else {
        resolve(null)
      }
    })
  }

  const values = {
    user,
    loading,
    companyName,
    languageId,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
    getAccessToken,
    encryptePWD,
    getAC,
    apiUrl: getAC?.data?.record.api || (typeof window !== 'undefined' ? window.localStorage.getItem('apiUrl') : '')
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
