// ** React Imports
import { createContext, useContext, useEffect, useState } from 'react'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { KVSRepository } from 'src/repositories/KVSRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { AuthContext } from './AuthContext'

const ControlContext = createContext()

const ControlProvider = ({ children }) => {
  const { getRequest } = useContext(RequestsContext)
  const [apiPlatformLabels, setApiPlatformLabels] = useState(null)
  const { user } = useContext(AuthContext)

  useEffect(() => {
    getLabels(ResourceIds.Common, setApiPlatformLabels)
  }, [user?.languageId])

  const platformLabels = apiPlatformLabels
    ? Object.fromEntries(apiPlatformLabels.map(({ key, value }) => [key, value]))
    : {}

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
