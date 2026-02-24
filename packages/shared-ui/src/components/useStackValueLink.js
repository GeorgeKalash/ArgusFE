import React, { useCallback } from 'react'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import { isClickOnText } from './linkTextUtils'
import { ResourceIds } from '@argus/shared-domain/src/resources/ResourceIds'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'

const getStackLoaderByResourceId = resourceId => {
  switch (resourceId) {
    case ResourceIds.Designer:
      return () => import('@argus/shared-ui/src/components/Shared/DesignerForm')

    case ResourceIds.Sketch:
      return () => import('@argus/shared-ui/src/components/Shared/Forms/SketchForm')

    case ResourceIds.Item:
      return () => import('@argus/shared-ui/src/components/Shared/ItemDetails')

    default:
      return null
  }
}

export const useStackValueLink = ({ linkOpen, inputElRef, textMeasureRef }) => {
  const { stack } = useWindow()

  // const { access } = useResourceParams({
  //   datasetId: linkOpen?.resourceId
  // })

  // const canOpen = !!access?.record?.accessFlags?.edit

  const isValueLink = !!linkOpen

  const linkStyle = !isValueLink
    ? {}
    : {
        color: '#1976d2',
        textDecoration: 'underline',
        cursor: 'pointer',
        opacity: 1
      }

  const openStack = useCallback(async () => {
    // if (!canOpen) return

    const loader = getStackLoaderByResourceId(linkOpen.resourceId)
    if (!loader) return

    const mod = await loader()
    const Component = mod?.default
    if (!Component) return

    stack({
      Component,
      props: { ...(linkOpen?.props || {}) }
    })
  }, [linkOpen?.props])

  const handleClick = async e => {
    // if (!canOpen) return

    const inputEl = inputElRef.current
    const textMeasureEl = textMeasureRef.current
    if (!inputEl || !textMeasureEl) return

    const clickedOnText = isClickOnText({ e, inputEl, textMeasureEl })
    if (!clickedOnText) return

    e.preventDefault()
    e.stopPropagation()
    await openStack()
  }

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

  return { linkStyle, handleClick, TextMeasure }
}