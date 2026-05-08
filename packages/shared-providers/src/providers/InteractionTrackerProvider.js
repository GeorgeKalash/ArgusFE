import React, { createContext, useState, useCallback, useContext } from 'react'

const InteractionTrackerContext = createContext()

export const InteractionTrackerProvider = ({ children }) => {
  const [interactions, setInteractions] = useState([])

  const track = useCallback(pageId => {
    setInteractions(prev => {
      const safePrev = Array.isArray(prev) ? prev : []
      if (safePrev.includes(pageId)) return safePrev

      return [...safePrev, pageId]
    })
  }, [])

  const clearPageInteractions = useCallback(pageId => {
    setInteractions(prev => prev?.filter(id => id !== pageId))
  }, [])

  return (
    <InteractionTrackerContext.Provider
      value={{
        track,
        interactions,
        clearPageInteractions
      }}
    >
      {children}
    </InteractionTrackerContext.Provider>
  )
}

export const useInteractionTracker = () => {
  return useContext(InteractionTrackerContext)
}

export { InteractionTrackerContext }