import React, { createContext, useState, useCallback, useContext } from 'react'
import isEqual from 'lodash/isEqual'

const InteractionTrackerContext = createContext()

export const InteractionTrackerProvider = ({ children }) => {
  const [interactions, setInteractions] = useState([])
  const [fieldStates, setFieldStates] = useState([])
  
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


  const trackFieldState = useCallback((pageId, fieldValues) => {
    if (!pageId || !fieldValues) return

    let pageBecameDirty = false
    setFieldStates(prev => {
      const safePrev = Array.isArray(prev) ? prev : []
      const existingItem = safePrev.find(item => item.pageId === pageId)
      if (!existingItem) {
        return [
          ...safePrev,
          {
            pageId,
            initialValues: fieldValues,
            currentValues: fieldValues,
            isDirty: false
          }
        ]
      }

      const initialValues = existingItem.initialValues
      const isDirty = !isEqual(initialValues, fieldValues)
      pageBecameDirty = isDirty

      if (!isDirty) {
        return safePrev.map(item =>
          item.pageId === pageId
            ? {
                ...item,
                currentValues: fieldValues,
                isDirty: false
              }
            : item
        )
      }

      return safePrev.map(item =>
        item.pageId === pageId
          ? {
              ...item,
              currentValues: fieldValues,
              isDirty: true
            }
          : item
      )
    })

    if (pageBecameDirty) {
      setInteractions(prev => {
        const safePrev = Array.isArray(prev) ? prev : []
        const existingItem = safePrev.find(item => item.pageId === pageId)
        if (existingItem) return safePrev

        return [
          ...safePrev,
          {
            pageId,
            source: ['ToolbarSections']
          }
        ]
      })
    }
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