// ** React Imports
import { createContext, useContext, useState } from 'react'

// ** Custom Imports
import ErrorWindow from 'src/components/Shared/ErrorWindow'

// ** API
import { RequestsContext } from 'src/providers/RequestsContext'
import { KVSRepository } from 'src/repositories/KVSRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'

const ControlContext = createContext()

const ControlProvider = ({ children }) => {

    const { getRequest } = useContext(RequestsContext)
    const [errorMessage, setErrorMessage] = useState(null)

    const getLabels = (resourceId, callback) => {
      var parameters = '_dataset=' + resourceId
  
      getRequest({
        extension: KVSRepository.getLabels,
        parameters: parameters
      })
        .then(res => {

          callback(res.list)
        })
        .catch(error => {
          console.log('error at getLabels')
          setErrorMessage(error)
        })
    }
    
    const getAccess = (resourceId, callback) => {
      var parameters = '_resourceId=' + resourceId
  
      getRequest({
        extension: AccessControlRepository.maxAccess,
        parameters: parameters
      })
        .then(res => {
          console.log({ maxAccess: res })
          callback(res)
        })
        .catch(error => {
          console.log('error at getAccess')
          setErrorMessage(error)
        })
    }

    const values = {
        getLabels,
        getAccess,
    }

    return (
      <>
        <ControlContext.Provider value={values}>{children}</ControlContext.Provider>
        <ErrorWindow open={errorMessage} onClose={() => setErrorMessage(null)} message={errorMessage} />
      </>
    )
    
}

export { ControlContext, ControlProvider }
