import React, { useRef } from 'react'
import { Box } from '@mui/material'
import { useStackValueLink } from '@argus/shared-hooks/src/hooks/useStackValueLink'

const LinkCellRenderer = ({ value, linkOpen, data, params }) => {
  const inputElRef = useRef(null)
  const textMeasureRef = useRef(null)

  const resolvedLinkOpen = linkOpen ? linkOpen(data, params) : null

  const link = resolvedLinkOpen
    ? useStackValueLink({
        linkOpen: resolvedLinkOpen,
        inputElRef,
        textMeasureRef
      })
    : null

  const linkStyle = link?.linkStyle
  const TextMeasure = link?.TextMeasure

  const handleClick = event => {
    if (link?.handleClick) {
      link.handleClick(event)
      if (event.defaultPrevented) return
    }
  }

  if (value == null || value === '') return null

  return (
    <Box
      onClick={handleClick}
      className='fieldWrapper nowrap'
      ref={node => {
        inputElRef.current = node
        if (node) {
          node.value = node.innerText ?? ''
        }
      }}
      style={linkStyle || {}}
    >
      {value}
      {TextMeasure && <TextMeasure />}
    </Box>
  )
}

export default LinkCellRenderer