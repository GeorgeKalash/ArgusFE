// ** React Imports
import { createContext, useContext } from 'react'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { KVSRepository } from 'src/repositories/KVSRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'

const ControlContext = createContext()

const ControlProvider = ({ children }) => {
  const { getRequest } = useContext(RequestsContext)

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
    getAccess
  }

  return (
    <>
      <ControlContext.Provider value={values}>{children}</ControlContext.Provider>
    </>
  )
}

export { ControlContext, ControlProvider }
