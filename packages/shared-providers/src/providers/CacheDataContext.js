import React, { createContext, useContext, useState, useRef } from 'react'

const CacheDataContext = createContext()

export const useCacheDataContext = () => useContext(CacheDataContext)

export const CacheDataProvider = ({ children }) => {
  const [store, setStore] = useState({})
  const apiQueueRef = useRef(new Map())

  const updateStore = (key, newStore) => {
    setStore(prevStores => ({
      ...prevStores,
      [key]: newStore
    }))
  }

  function hashQueryKey(queryKey) {
    return JSON.stringify(queryKey)
  }

  async function fetchWithCache({ queryKey, queryFn }) {
    const hashedKey = hashQueryKey(queryKey)
    if (apiQueueRef.current.has(hashedKey)) {
      return apiQueueRef.current.get(hashedKey)
    }

    const apiPromise = queryFn()
      .then(response => {
        apiQueueRef.current.delete(hashedKey)
        updateStore(hashQueryKey(queryKey), response)

        return response
      })
      .catch(error => {
        apiQueueRef.current.delete(hashedKey)
        throw error
      })
    apiQueueRef.current.set(hashedKey, apiPromise)

    return apiPromise
  }

  return (
    <CacheDataContext.Provider value={{ cacheStore: store, updateStore, fetchWithCache }}>
      {children}
    </CacheDataContext.Provider>
  )
}
