import React, { createContext, useState, useCallback, useContext } from 'react'
import isEqual from 'lodash/isEqual'

const InteractionTrackerContext = createContext()

export const InteractionTrackerProvider = ({ children }) => {
  const [interactions, setInteractions] = useState([])
  const [fieldStates, setFieldStates] = useState([])
  
  const normalized = value => {
    if (value instanceof Date) return value.dateOnly ? value.toDateString() : value.valueOf()
    if (Array.isArray(value)) return value.map(normalized)
    if (value && typeof value === 'object')
      return Object.fromEntries(
        Object.entries(value)
          .filter(([, v]) => v !== null && v !== undefined)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => [k, normalized(v)])
      )
    
    return value
  }

  const track = useCallback((pageId, source) => {
    setInteractions(prev => {
      const safePrev = Array.isArray(prev) ? prev : []

      const existingItem = safePrev.find(item => item.pageId === pageId)

      if (!source) return safePrev

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


  const trackFieldState = useCallback((pageId, fieldValues, initials) => {
    if (!pageId || !fieldValues) return

    setFieldStates(prev => {
      const safePrev = Array.isArray(prev) ? prev : []
      const existingItem = safePrev.find(item => item.pageId === pageId)
      const initialValues = initials ?? existingItem?.initialValues ?? fieldValues
      const isDirty = !isEqual(initialValues, fieldValues)

      if (!existingItem) {
        if (isDirty) {
          setInteractions(p => [...p, { pageId, source: ['gridToolbar'] }])
        }
        return [...safePrev, { pageId, initialValues, currentValues: fieldValues, isDirty }]
      }

      if (!isDirty) {
        setInteractions(p => p.filter(item => item.pageId !== pageId))
      } else {
        setInteractions(p => {
          if (p.find(item => item.pageId === pageId)) return p
          return [...p, { pageId, source: ['gridToolbar'] }]
        })
      }

      return safePrev.map(item =>
        item.pageId === pageId
          ? { ...item, currentValues: fieldValues, isDirty }
          : item
      )
    })
  }, [])
  
  const getPageState = useCallback(
    pageId => fieldStates.find(item => item.pageId === pageId) || null,
    [fieldStates]
  )

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

      if (updatedSources.length === 0) {
        return safePrev.filter(item => item.pageId !== pageId)
      }

      return safePrev.map(item =>
        item.pageId === pageId
          ? {
              ...item,
              source: updatedSources
            }
          : item
      )
    })

    if (!source) {
      setFieldStates(prev =>
        prev.filter(item => item.pageId !== pageId)
      )
    }
  }, [])

  console.log('interactions', interactions)
  console.log('fieldStates', fieldStates)

  return (
    <InteractionTrackerContext.Provider
      value={{
        track,
        interactions,
        clearPageInteractions,
        trackFieldState,
        getPageState
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