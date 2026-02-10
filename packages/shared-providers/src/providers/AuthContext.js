import { createContext, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import SHA1 from 'crypto-js/sha1'
import jwt from 'jwt-decode'
import { getFromDB, saveToDB } from '@argus/shared-domain/src/lib/indexDB'

const defaultProvider = {
  user: null,
  loading: true,
  setUser: () => {},
  setLoading: () => {},
  login: () => Promise.resolve(),
  logout: () => Promise.resolve()
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999
}

const modalStyle = {
  background: '#fff',
  borderRadius: 8,
  width: 400,
  maxWidth: '90%',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden'
}

const headerStyle = {
  background: '#1f1f1f',
  color: '#fff',
  padding: '12px 16px',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontWeight: 'bold'
}

const closeButtonStyle = {
  background: 'transparent',
  border: 'none',
  color: '#fff',
  fontSize: 16,
  cursor: 'pointer'
}

const messageStyle = {
  padding: 20,
  fontSize: 14,
  color: '#333'
}

const footerStyle = {
  padding: '12px 16px',
  display: 'flex',
  justifyContent: 'flex-end'
}

const okButtonStyle = {
  background: '#1f1f1f',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  padding: '8px 16px',
  cursor: 'pointer'
}

const AuthContext = createContext(defaultProvider)

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
  const [validCompanyName, setValidCompanyName] = useState(false)
  const [deployHost, setDeployHost] = useState('')
  const [getAC, setGetAC] = useState({})
  const [languageId, setLanguageId] = useState(1)
  const [errorMsg, setErrorMsg] = useState(null)
  const [config, setConfig] = useState(null)
  const router = useRouter()

  const initAuth = async () => {
    const userData = window.localStorage.getItem('userData') || window.sessionStorage.getItem('userData')
    const savedLanguageId = window.localStorage.getItem('languageId')
    const storedCompany = await getFromDB('authSettings', 'companyName')
    if (storedCompany) setCompanyName(storedCompany)
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

  const fetchData = async () => {
    setErrorMsg(null)
    const matchHostname = window.location.hostname.match(/^(.+)\.softmachine\.co$/)
    const isDeploy = !matchHostname || matchHostname?.[1]?.toLowerCase() == 'deploy'
    const accountOnPrem = config?.onPremCode
    const accountName = accountOnPrem ? accountOnPrem : isDeploy ? companyName : matchHostname?.[1]
    setDeployHost(isDeploy)
    try {
      if (!accountName) {
        setValidCompanyName(false)
        setLoading(false)

        return
      }
      if (validCompanyName) {
        setLoading(false)

        return
      }

      const response = await axios.get(`${config?.authUrl}/MA.asmx/getAC?_accountName=${accountName}`)
      const record = response?.data?.record
      setGetAC(response || null)

      if (!record || (isDeploy && !record.trial)) {
        setErrorMsg(`Invalid deploy account: ${accountName}`)
        setValidCompanyName(false)
      } else {
        setCompanyName(record.accountName || '')
        setValidCompanyName(!!record.accountName)
        window.localStorage.setItem('apiUrl', record.api || '')
        await saveToDB('authSettings', 'companyName', record.accountName)
      }
    } catch (error) {
      console.error('Error Fetching Data: ', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetch("/api/client-config/")
      .then((res) => res.json())
      .then((data) => {
        console.log("CONFIG FROM API:", data)
        setConfig(data?.config)
      })
  }, [])


  useEffect(() => {
    initAuth()
  }, [])

  useEffect(() => {
    if (!config) return

    fetchData()
  }, [config, companyName])

  const handleLogin = async (params, errorCallback) => {
    try {
      if (!validCompanyName) return

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

      const signIn3 = await axios.get(`${config?.authUrl}/MA.asmx/signIn3?${signIn3Params}`, {
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
        dateFormat: defaultSettings.data.record?.value ? defaultSettings.data.record?.value : 'dd/MM/yyyy'
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
        forcePasswordReset: signIn3.data.record.forcePasswordReset,
        ...signIn3.data.record
      }
      setLanguageId(loggedUser.languageId)
      window.localStorage.setItem('languageId', loggedUser.languageId)
      if (signIn3.data.record.forcePasswordReset == true) {
        errorCallback({
          username: params.username,
          loggedUser,
          signIn3: signIn3.data.record,
          getUS2: getUS2.data.record
        })
      } else if (getUS2.data.record.umcpnl === true || getUS2.data.record.is2FAEnabled === true) {
        errorCallback({
          username: params.username,
          loggedUser,
          getUS2: getUS2.data.record
        })
      } else {
        EnableLogin(loggedUser)
      }
    } catch (error) {
      if (errorCallback) errorCallback(error)
    }
  }

  const EnableLogin = loggedUser => {
    setUser(loggedUser)
    window.sessionStorage.setItem('userData', JSON.stringify(loggedUser))
    const returnUrl = router.query.returnUrl
    const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'
    router.replace(redirectURL)
  }

  const handleLogout = async () => {
    setUser(null)
    window.localStorage.removeItem('userData')
    window.sessionStorage.removeItem('userData')
    await router.push('/login')
    initAuth()
    fetchData()
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
            .post(`${config?.authUrl}/MA.asmx/newAT`, bodyFormData, {
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
    setCompanyName,
    validCompanyName,
    deployHost,
    languageId,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout,
    getAccessToken,
    encryptePWD,
    EnableLogin,
    getAC,
    apiUrl: getAC?.data?.record?.api || (typeof window !== 'undefined' ? window.localStorage.getItem('apiUrl') : '')
  }

  return (
    <AuthContext.Provider value={values}>
      {children}
      {errorMsg && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <div style={headerStyle}>
              <span>Error</span>
              <button style={closeButtonStyle} onClick={() => setErrorMsg(null)}>
                ×
              </button>
            </div>
            <div style={messageStyle}>{errorMsg}</div>
            <div style={footerStyle}>
              <button style={okButtonStyle} onClick={() => setErrorMsg(null)}>
                Ok
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  )
}

export { AuthContext, AuthProvider }
