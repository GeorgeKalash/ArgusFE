import { createContext, useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { KVSRepository } from 'src/repositories/KVSRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { AuthContext } from './AuthContext'
import axios from 'axios'
import { SystemRepository } from 'src/repositories/SystemRepository'

const ControlContext = createContext()

const ControlProvider = ({ children }) => {
  const { getRequest } = useContext(RequestsContext)
  const { user, apiUrl, languageId } = useContext(AuthContext)
  const userData = window.sessionStorage.getItem('userData')
  const [defaultsData, setDefaultsData] = useState([])
  const [apiPlatformLabels, setApiPlatformLabels] = useState(null)

  useEffect(() => {
    if (userData != null) getDefaults(setDefaultsData)
  }, [userData, user?.userId])

  const getDefaults = callback => {
    var parameters = `_filter=`
    getRequest({
      extension: SystemRepository.Defaults.qry,
      parameters: parameters
    }).then(res => {
      callback(res)
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

  useEffect(() => {
    getPlatformLabels(ResourceIds.Common, setApiPlatformLabels)
  }, [user?.languageId, languageId])

  const platformLabels = apiPlatformLabels
    ? Object.fromEntries(apiPlatformLabels.map(({ key, value }) => [key, value]))
    : {}

  const getPlatformLabels = (resourceId, callback) => {
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
        callback(res.data.list)
      })
      .catch(error => {})
  }

  const getLabels = (resourceId, callback) => {
    var parameters = '_dataset=' + resourceId
    getRequest({
      extension: KVSRepository.getLabels,
      parameters: parameters
    }).then(res => {
      callback(res.list)
    })
  }

  const getAccess = (resourceId, callback) => {
    var parameters = '_resourceId=' + resourceId
    getRequest({
      extension: AccessControlRepository.maxAccess,
      parameters: parameters
    }).then(res => {
      callback(res)
    })
  }

  const values = {
    getLabels,
    getAccess,
    platformLabels,
    defaultsData,
    setDefaultsData,
    updateDefaults
  }

  return <ControlContext.Provider value={values}>{children}</ControlContext.Provider>
}

export { ControlContext, ControlProvider }
