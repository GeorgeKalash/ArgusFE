// ** React Imports
import { createContext, useEffect, useState } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'axios'

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
import SHA1 from 'crypto-js/sha1';

const encryptePWD = (pwd) => {

  var encryptedPWD = SHA1(pwd).toString();
  var shuffledString = "";

  for (let i = 0; i < encryptedPWD.length; i = i + 8) {

    var subString = encryptedPWD.slice(i, i + 8)

    shuffledString += subString.charAt(6) + subString.charAt(7);
    shuffledString += subString.charAt(4) + subString.charAt(5);
    shuffledString += subString.charAt(2) + subString.charAt(3);
    shuffledString += subString.charAt(0) + subString.charAt(1);
  }

  return shuffledString.toUpperCase();
}

const AuthProvider = ({ children }) => {
  // ** States
  const [user, setUser] = useState(defaultProvider.user)
  const [loading, setLoading] = useState(defaultProvider.loading)

  // ** Hooks
  const router = useRouter()
  useEffect(() => {

    const initAuth = async () => {
      const storedToken = window.localStorage.getItem(authConfig.storageTokenKeyName)
      if (storedToken) {
        setUser(JSON.parse(window.localStorage.getItem('userData')))
        setLoading(false)
      } else {
        setLoading(false)
      }
    }
    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = async (params, errorCallback) => {
    try {

      const getAC = await axios({
        method: 'GET',
        url: `${process.env.NEXT_PUBLIC_AuthURL}/MA.asmx/getAC?_accountName=anthonys`
      })

      const getUS2 = await axios({
        method: 'GET',
        url: `${getAC.data.record.api}/SY.asmx/getUS2?_email=${params.email}`,
        headers: {
          'accountId': '105',
          'dbe': '1',
          'dbs': '2',
        },
      })

      const signIn3Params = `_email=${params.email}&_password=${encryptePWD(params.password)}&_accountId=${getAC.data.record.accountId}&_userId=${getUS2.data.record.recordId}`

      const signIn3 = await axios({
        method: 'GET',
        url: `${process.env.NEXT_PUBLIC_AuthURL}/MA.asmx/signIn3?${signIn3Params}`,
        headers: {
          'accountId': '105',
          'dbe': '1',
          'dbs': '2',
        },
      })

      const loggedUser = {
        accountId: getAC.data.record.accountId,
        userId: getUS2.data.record.recordId,
        email: getUS2.data.record.email,
        userType: getUS2.data.record.userType,
        employeeId: getUS2.data.record.employeeId,
        fullName: getUS2.data.record.fullName,
        role: 'admin',
        username: getUS2.data.record.fullName,
        id: 1,

        ...signIn3.data.record
      }

      params.rememberMe
        ? window.localStorage.setItem(authConfig.storageTokenKeyName, signIn3.data.record.accessToken)
        : null
      const returnUrl = router.query.returnUrl
      setUser({ ...loggedUser })
      params.rememberMe ? window.localStorage.setItem('userData', JSON.stringify(loggedUser)) : null
      const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'

      router.replace(redirectURL)
    } catch (error) {
      if (errorCallback) errorCallback(error)
    }
  }

  const handleLogout = () => {
    setUser(null)
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    router.push('/login')
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    login: handleLogin,
    logout: handleLogout
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
