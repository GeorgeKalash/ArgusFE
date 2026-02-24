import React from 'react'
import { Link, Typography } from '@mui/material'
import inputs from '@argus/shared-ui/src/components/Inputs/Inputs.module.css'
import { useWindow } from '@argus/shared-providers/src/providers/windows'

const HyperlinkValue = ({
  value,
  linkConfig,
  rowData
}) => {
  const { stack } = useWindow()

  if (!value) return null

  const executeAction = async (actionConfig) => {
    if (!actionConfig) return

    switch (actionConfig.type) {
      case 'OPEN_STACK':
        const props =
          typeof actionConfig?.params?.props === 'function' && rowData
            ? actionConfig.params.props(rowData)
            : actionConfig?.params?.props || {}

        stack({
          Component: linkConfig?.params?.component,
          props
        })
        break

      case 'OPEN_URL':
        if (actionConfig.params?.url) {
          window.open(actionConfig.params.url, '_blank')
        }
        break

      case 'API_CALL':
        //api call
        break

      default:
        console.warn('Unknown action type', actionConfig.type)
    }
  }

  const handleClick = async (e) => {
    e.stopPropagation()

    if (!linkConfig) return

    await executeAction(linkConfig)
  }

  if (!linkConfig) {
    return <Typography component='span'>{value}</Typography>
  }

  return (
    <div className={inputs.startAdornment}>
      <Link
        component='span'
        variant='inherit'
        className={inputs.inputBase}
        onClick={handleClick}
        sx={{
          color: '#1976d2',
          textDecoration: 'underline',
          cursor: 'pointer'
        }}
      >
        {value}
      </Link>
    </div>
  )
}

export default HyperlinkValue