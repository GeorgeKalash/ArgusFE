import React from 'react'
import { Link, Typography } from '@mui/material'
import { executeAction } from '@argus/shared-utils/src/utils/HyperlinksActions'

const HyperlinkValue = ({
  value,
  linkConfig,
  disabled = false
}) => {
  if (!value) return null

  const handleClick = async (e) => {
    e.stopPropagation()

    if (disabled || !linkConfig) return

    await executeAction(linkConfig)
  }

  if (!linkConfig) {
    return <Typography component='span'>{value}</Typography>
  }

  return (
    <Link
      component='button'
      onClick={handleClick}
      underline='hover'
      disabled={disabled}
      style={{
        color: '#1976d2',
        textDecoration: 'underline',
        cursor: disabled ? 'default' : 'pointer',
       }}
    >
      {value}
    </Link>
  )
}

export default HyperlinkValue