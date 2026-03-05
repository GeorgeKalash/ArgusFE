import React, { useCallback, useContext, useRef } from 'react'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { isClickOnText } from './linkTextUtils'
import { ResourceRegistry } from './ResourceRegistry'
import ConfirmationDialog from '@argus/shared-ui/src/components/ConfirmationDialog'

export const useStackValueLink = ({ linkOpen, inputElRef, textMeasureRef, cacheOnlyMode }) => {
  const { stack } = useWindow()
  const { getAccess, platformLabels } = useContext(ControlContext)

  const inflightRef = useRef(false)
  const noAccessInflightRef = useRef(false)

  const isValueLink = !!linkOpen

  const linkStyle = !isValueLink
    ? {}
    : {
        color: '#1976d2',
        textDecoration: 'underline',
        cursor: 'pointer',
        opacity: 1
      }

  const fetchAccess = useCallback(
    resourceId =>
      new Promise(resolve => {
        let resolved = false
        let lastValue

        const done = value => {
          if (resolved) return
          resolved = true
          resolve(value)
        }

        const onAccess = value => {
          lastValue = value

          const flags = value?.record?.accessFlags
          const hasFlags = !!flags && typeof flags === 'object'
          const hasRecord = !!value?.record

          if (hasFlags || hasRecord) done(value)
        }

        const t = setTimeout(() => done(lastValue), 1500)

        const wrappedOnAccess = value => {
          onAccess(value)
          if (resolved) clearTimeout(t)
        }

        getAccess(resourceId, wrappedOnAccess, cacheOnlyMode)
      }),
    [getAccess, cacheOnlyMode]
  )

  const openNoAccessPopup = useCallback(() => {
    if (noAccessInflightRef.current) return
    noAccessInflightRef.current = true

    const closePopup = win => {
      noAccessInflightRef.current = false
      win?.close?.()
    }

    stack({
      Component: ConfirmationDialog,
      props: {
        DialogText: "You don’t have permission to open this screen.",
        okButtonAction: closePopup,
        fullScreen: false,
        close: true
      },
      width: 420,
      height: 160,
      title: platformLabels?.Confirmation || 'Confirmation'
    })
  }, [stack, platformLabels])

  const openStack = useCallback(async () => {
    const resourceId = linkOpen?.resourceId
    if (!resourceId) return false

    if (inflightRef.current) return false
    inflightRef.current = true

    try {
      const access = await fetchAccess(resourceId)

      const flags = access?.record?.accessFlags
      const flagValues = flags && typeof flags === 'object' ? Object.values(flags) : null

      const noAccess =
        !flagValues || flagValues.length === 0 || flagValues.every(v => v === false)

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
  }, [linkOpen])

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