import React, { createContext, useContext, useState } from 'react'

const CacheStoreContext = createContext()

export const useCacheStoreContext = () => useContext(CacheStoreContext)

export const CacheStoreProvider = ({ children }) => {
  const [store, setStore] = useState({})

  const updateCacheStore = (key, newStore) => {
    setStore(prevStores => ({
      ...prevStores,
      [key]: newStore
    }))
  }

  return (
    <CacheStoreContext.Provider value={{ cacheStore: store, updateCacheStore }}>{children}</CacheStoreContext.Provider>
  )
}
