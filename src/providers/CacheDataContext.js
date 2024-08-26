import React, { createContext, useContext, useState, useCallback } from 'react'

const CacheDataContext = createContext()

export const useCacheDataContext = () => useContext(CacheDataContext)

export const CacheDataProvider = ({ children }) => {
  const [store, setStore] = useState({})

  const updateStore = (key, newStore) => {
    setStore(prevStores => ({
      ...prevStores,
      [key]: newStore
    }))
  }

  return <CacheDataContext.Provider value={{ cacheStore: store, updateStore }}>{children}</CacheDataContext.Provider>
}
