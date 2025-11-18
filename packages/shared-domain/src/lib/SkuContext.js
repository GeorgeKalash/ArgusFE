import React, { createContext, useContext, useState } from 'react'

const SkuContext = createContext()

export const useSku = () => useContext(SkuContext)

export const SkuProvider = ({ children }) => {
  const [sku, setSku] = useState(null)

  return <SkuContext.Provider value={{ sku, setSku }}>{children}</SkuContext.Provider>
}
