import React, { useState } from 'react'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { useWindow } from 'src/windows'
import ReportParameterBrowser from 'src/components/Shared/ReportParameterBrowser'
import { Grid } from '@mui/material'

const RPBGridToolbar = ({ add, access, onApply, reportName, onSearchClear, ...rest }) => {
  const { stack } = useWindow()
  const [paramsArray, setParamsArray] = useState([])
  const [search, setSearch] = useState([])

  const openRPB = () => {
    stack({
      Component: ReportParameterBrowser,
      props: {
        reportName: reportName,
        paramsArray,
        setParamsArray
      },
      width: 700,
      height: 500,
      title: 'Report Parameters Browser'
    })
  }

  const actions = [
    {
      key: 'OpenRPB',
      condition: true,
      onClick: openRPB,
      disabled: false
    },
    {
      key: 'GO',
      condition: true,
      onClick: () => onApply({ search, paramsArray }),
      disabled: false
    }
  ]

  return (
    <GridToolbar
      onAdd={add}
      maxAccess={access}
      onSearch={() => onApply({ search, paramsArray })}
      onSearchClear={() => {
        setSearch()
        onSearchClear()
      }}
      onSearchChange={e => {
        setSearch(e.target.value)
      }}
      inputSearch={onSearchClear ? true : false}
      actions={actions}
      bottomSection={
        paramsArray &&
        paramsArray.length > 0 && (
          <Grid container spacing={2} sx={{ display: 'flex', px: 2 }}>
            {paramsArray.map((param, i) => (
              <Grid key={i} item>
                [<b>{param.caption}:</b> {param.display}]
              </Grid>
            ))}
          </Grid>
        )
      }
      {...rest}
    />
  )
}

export default RPBGridToolbar
