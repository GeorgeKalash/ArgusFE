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
    setInteractions(prev => {
      const copy = { ...prev }
      delete copy[pageId]
      return copy
    })
  }, [])

  const hasPageInteraction = useCallback(
    pageId => !!interactions[pageId]?.length,
    [interactions]
  )

  return (
    <InteractionTrackerContext.Provider
      value={{
        track,
        interactions,
        clearPageInteractions,
        hasPageInteraction
      }}
    >
      {children}
    </InteractionTrackerContext.Provider>
  )
}

export const useInteractionTracker = () => {
  const context = useContext(InteractionTrackerContext)

  if (!context) {
    throw new Error(
      'useInteractionTracker must be used within InteractionTrackerProvider'
    )
  }

  return context
}

export { InteractionTrackerContext }