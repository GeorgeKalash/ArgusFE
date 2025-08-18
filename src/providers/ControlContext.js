import { createContext, useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { KVSRepository } from 'src/repositories/KVSRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { AuthContext } from './AuthContext'
import axios from 'axios'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useError } from 'src/error'
import { debounce } from 'lodash'
import { commonResourceIds } from 'src/resources/commonResourceIds'
import { useLabelsAccessContext } from './LabelsAccessContext'

const ControlContext = createContext()

const ControlProvider = ({ children }) => {
  const { getRequest } = useContext(RequestsContext)
  const { user, apiUrl, languageId } = useContext(AuthContext)
  const userData = window.sessionStorage.getItem('userData')
  const [defaultsData, setDefaultsData] = useState([])
  const [userDefaultsData, setUserDefaultsData] = useState([])
  const [systemChecks, setSystemChecks] = useState([])
  const [loading, setLoading] = useState(false)
  const errorModel = useError()
  const { labels, setLabels, access, setAccess, apiPlatformLabels, setApiPlatformLabels } = useLabelsAccessContext()

  const addLabels = (resourceId, labels) => {
    setLabels(prevData => ({
      ...prevData,
      [resourceId]: labels
    }))
  }

  const addAccess = (resourceId, access) => {
    setAccess(prevData => ({
      ...prevData,
      [resourceId]: access
    }))
  }

  async function showError(props) {
    if (errorModel) await errorModel.stack(props)
  }

  useEffect(() => {
    if (userData != null) {
      getDefaults(setDefaultsData)
      getUserDefaults(setUserDefaultsData)
      getSystemChecks(setSystemChecks)
    }
  }, [userData, user?.userId])

  const countryId = defaultsData?.list?.find(({ key }) => key === 'countryId')?.value

  useEffect(() => {
    ;(async function () {
      if (countryId) {
        const res = await getRequest({
          extension: SystemRepository.Country.get,
          parameters: `_recordId=${countryId}`
        })

        const newItem = { key: 'countryRef', value: res?.record?.reference }

        setDefaultsData(prevState => ({
          ...prevState,
          list: [...prevState.list, newItem],
          count: prevState.list.length + 1
        }))
      }
    })()
  }, [countryId])

  const getDefaults = callback => {
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Defaults.qry,
      parameters: parameters
    }).then(res => {
      callback(res)
    })
  }

  const getSystemChecks = callback => {
    const parameters = '_scope=1'
    getRequest({
      extension: SystemRepository.SystemChecks.qry,
      parameters
    }).then(res => {
      callback(res.list)
    })
  }

  const updateDefaults = data => {
    const updatedDefaultsData = [...defaultsData.list, ...data].reduce((acc, obj) => {
      const existing = acc.find(item => item.key === obj.key)
      if (existing) {
        existing.value = obj.value
      } else {
        acc.push({ ...obj, value: obj.value })
      }

      return acc
    }, [])
    setDefaultsData({ list: updatedDefaultsData })
  }

  const getUserDefaults = callback => {
    var parameters = '_userId=' + user?.userId
    getRequest({
      extension: SystemRepository.UserDefaults.qry,
      parameters: parameters
    }).then(res => {
      callback(res)
    })
  }

  useEffect(() => {
    getPlatformLabels(ResourceIds.Common, setApiPlatformLabels)
  }, [user?.languageId, languageId])

  const debouncedCloseLoading = debounce(() => {
    setLoading(false)
  }, 500)

  const platformLabels = apiPlatformLabels
    ? Object.fromEntries(apiPlatformLabels.map(({ key, value }) => [key, value]))
    : {}

  const getPlatformLabels = (resourceId, callback) => {
    const disableLoading = false
    !disableLoading && !loading && setLoading(true)

    const throwError = false

    var parameters = '_dataset=' + resourceId + '&_language=1'

    axios({
      method: 'GET',
      url: apiUrl + KVSRepository.getPlatformLabels + '?' + parameters,
      headers: {
        'Content-Type': 'multipart/form-data',
        LanguageId: user?.languageId || languageId
      }
    })
      .then(res => {
        if (!disableLoading) debouncedCloseLoading()
        callback(res.data.list)
      })
      .catch(error => {
        debouncedCloseLoading()
        showError({
          message: error,
          height: error.response?.status === 404 || error.response?.status === 500 ? 400 : ''
        })
        if (throwError) reject(error)
      })
  }

  const getLabels = (resourceId, callback, cacheOnlyMode) => {
    const cache = commonResourceIds.includes(resourceId)
    if ((cache && labels?.[resourceId]) || cacheOnlyMode) {
      callback(labels?.[resourceId])
    } else {
      var parameters = '_dataset=' + resourceId
      getRequest({
        extension: KVSRepository.getLabels,
        parameters: parameters
      }).then(res => {
        if (res?.list) {
          if (cache && !labels?.[resourceId]) {
            addLabels(resourceId, res.list)
          }
          callback(res.list)
        }
      })
    }
  }

  const getAccess = (resourceId, callback, cacheOnlyMode) => {
    const cache = commonResourceIds.includes(resourceId)

    if ((cache && access?.[resourceId]) || cacheOnlyMode) {
      callback(access?.[resourceId])
    } else {
      var parameters = '_resourceId=' + resourceId
      getRequest({
        extension: AccessControlRepository.maxAccess,
        parameters: parameters
      }).then(res => {
        if (res?.record) {
          if (cache && !access?.[resourceId]) {
            addAccess(resourceId, res)
          }
          callback(res)
        }
      })
    }
  }

  const values = {
    getLabels,
    getAccess,
    platformLabels,
    defaultsData,
    setDefaultsData,
    updateDefaults,
    userDefaultsData,
    setUserDefaultsData,
    systemChecks
  }

  return <ControlContext.Provider value={values}>{children}</ControlContext.Provider>
}

export { ControlContext, ControlProvider }
