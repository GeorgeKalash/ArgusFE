// ** React Imports
import { createContext, useContext, useEffect, useState } from 'react'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { KVSRepository } from 'src/repositories/KVSRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { AuthContext } from './AuthContext'
import axios from 'axios'

const ControlContext = createContext()

const ControlProvider = ({ children }) => {
  const { getRequest } = useContext(RequestsContext)
  const [apiPlatformLabels, setApiPlatformLabels] = useState(null)
  const { user, apiUrl, languageId } = useContext(AuthContext)

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
    }).then(
      res => {
        callback(res.list)
      },
      error => {
        console.error(error, 'Access')
      }
    )
  }

  const getAccess = (resourceId, callback) => {
    var parameters = '_resourceId=' + resourceId
    getRequest({
      extension: AccessControlRepository.maxAccess,
      parameters: parameters
    }).then(
      res => {
        callback(res)
      },
      error => {
        console.error(error, 'Access')
      }
    )
  }

  const values = {
    getLabels,
    getAccess,
    platformLabels
  }

  return (
    <>
      <ControlContext.Provider value={values}>{children}</ControlContext.Provider>
    </>
  )
}

export { ControlContext, ControlProvider }
