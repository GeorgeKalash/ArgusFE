import { createContext, useContext, useState, useEffect } from 'react'

const LabelsAccessContext = createContext(null)
let cachedApiPlatformLabels = null

export const LabelsAccessContextProvider = ({ children }) => {
  const [labels, setLabels] = useState({})
  const [access, setAccess] = useState({})
  const [apiPlatformLabels, setApiPlatformLabels] = useState(cachedApiPlatformLabels)
  
  useEffect(() => {
    if (apiPlatformLabels) cachedApiPlatformLabels = apiPlatformLabels
  }, [apiPlatformLabels])

  return (
    <LabelsAccessContext.Provider
      value={{ labels, setLabels, access, setAccess, apiPlatformLabels, setApiPlatformLabels }}
    >
      {children}
    </LabelsAccessContext.Provider>
  )
}

export const useLabelsAccessContext = () => useContext(LabelsAccessContext)
