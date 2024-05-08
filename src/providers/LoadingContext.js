// LoadingProvider.js
import React, { createContext, useState } from 'react'

export const LoadingContext = createContext()

export const LoadingProvider = ({ children }) => {
  const [loadingValue, setLoadingValue] = useState(0)

  return <LoadingContext.Provider value={{ loadingValue, setLoadingValue }}>{children}</LoadingContext.Provider>
}
