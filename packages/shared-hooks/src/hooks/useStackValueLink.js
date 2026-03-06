import React, { useCallback, useRef } from 'react'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { useValueLinkAccess } from './useValueLinkAccess'
import { isClickOnText } from '@argus/shared-ui/src/components/linkTextUtils'
import { ResourceRegistry } from '@argus/shared-ui/src/components/ResourceRegistry'

export const useStackValueLink = ({ linkOpen, inputElRef, textMeasureRef, cacheOnlyMode }) => {
  const { stack } = useWindow()

  const { fetchAccess, hasNoAccess, openNoAccessPopup } = useValueLinkAccess({
    cacheOnlyMode
  })

  const inflightRef = useRef(false)

  const linkStyle = !linkOpen
    ? {}
    : {
        color: '#1976d2',
        textDecoration: 'underline',
        cursor: 'pointer',
        opacity: 1
      }

  const openStack = useCallback(async () => {
    const resourceId = linkOpen?.resourceId
    if (!resourceId) return false

    if (inflightRef.current) return false
    inflightRef.current = true

    try {
      const access = await fetchAccess(resourceId)

      const noAccess = hasNoAccess(access)

      if (noAccess) {
        openNoAccessPopup()
        return true
      }

      const entry = ResourceRegistry[resourceId]
      const loader = entry?.loader
      if (!loader) return false

      const mod = await loader()
      const Component = mod?.default
      if (!Component) return false

      stack({
        Component,
        props: { ...(linkOpen?.props || {}) }
      })

      return true
    } finally {
      inflightRef.current = false
    }
  }, [linkOpen, fetchAccess, hasNoAccess, openNoAccessPopup])

  const shouldHandleMouseDown = useCallback(
    e => {
      const inputEl = inputElRef.current
      const textMeasureEl = textMeasureRef.current
      if (!inputEl || !textMeasureEl) return false

      return !!isClickOnText({ e, inputEl, textMeasureEl })
    },
    [inputElRef, textMeasureRef]
  )

  const handleClick = useCallback(
    async e => {
      const inputEl = inputElRef.current
      const textMeasureEl = textMeasureRef.current
      if (!inputEl || !textMeasureEl) return false

      const clickedOnText = isClickOnText({ e, inputEl, textMeasureEl })
      if (!clickedOnText) return false

      e.preventDefault()
      e.stopPropagation()

      return !!(await openStack())
    },
    [inputElRef, textMeasureRef, openStack]
  )

  const TextMeasure = () => (
    <span
      ref={textMeasureRef}
      style={{
        position: 'absolute',
        visibility: 'hidden',
        whiteSpace: 'pre',
        pointerEvents: 'none'
      }}
    />
  )

  return { linkStyle, shouldHandleMouseDown, handleClick, TextMeasure }
}