import React, { createContext, useState, useCallback, useContext } from 'react'

const InteractionTrackerContext = createContext()

export const InteractionTrackerProvider = ({ children }) => {
  const [interactions, setInteractions] = useState([])

  const track = useCallback((pageId, source) => {
    setInteractions(prev => {
      const safePrev = Array.isArray(prev) ? prev : []

      const existingItem = safePrev.find(item => item.pageId === pageId)

      if (!source) {
        return safePrev
      }

      if (existingItem) {
        const existingSources = Array.isArray(existingItem.source)
          ? existingItem.source
          : existingItem.source
            ? [existingItem.source]
            : []

        if (existingSources.includes(source)) return safePrev

        return safePrev.map(item =>
          item.pageId === pageId
            ? {
                ...item,
                source: [...existingSources, source]
              }
            : item
        )
      }

      return [
        ...safePrev,
        {
          pageId,
          source: [source]
        }
      ]
    })
  }, [])

  const clearPageInteractions = useCallback((pageId, source = null) => {
    setInteractions(prev => {
      const safePrev = Array.isArray(prev) ? prev : []
      if (!source) return safePrev.filter(item => item.pageId !== pageId)

      const existingItem = safePrev.find(item => item.pageId === pageId)
      if (!existingItem) return safePrev

      const existingSources = Array.isArray(existingItem.source)
        ? existingItem.source
        : existingItem.source
          ? [existingItem.source]
          : []

      const updatedSources = existingSources.filter(s => s !== source)

      if (updatedSources.length > 0)
        return safePrev.map(item =>
          item.pageId === pageId
            ? { ...item, source: updatedSources }
            : item
        )

      return safePrev.filter(item => item.pageId !== pageId)
    })
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