import { createContext, useContext, useState } from 'react'

const LabelsAccessContext = createContext(null)

export const LabelsAccessContextProvider = ({ children }) => {
  const [labels, setLabels] = useState({})
  const [access, setAccess] = useState({})
  const [apiPlatformLabels, setApiPlatformLabels] = useState(null)

  return (
    <LabelsAccessContext.Provider
      value={{ labels, setLabels, access, setAccess, apiPlatformLabels, setApiPlatformLabels }}
    >
      {children}
    </LabelsAccessContext.Provider>
  )
}

export const useLabelsAccessContext = () => useContext(LabelsAccessContext)
