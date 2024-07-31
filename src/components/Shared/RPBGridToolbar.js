import React, { useState } from 'react'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { useWindow } from 'src/windows'
import ReportParameterBrowser from 'src/components/Shared/ReportParameterBrowser'
import { Grid } from '@mui/material'

const RPBGridToolbar = ({
  add,
  access,
  onApply,
  reportName,
  onSearchClear,
  onSearch,
  onClear,
  hasSearch = true,
  ...rest
}) => {
  const { stack } = useWindow()
  const [rpbParams, setRpbParams] = useState([])
  const [search, setSearch] = useState('')

  const openRPB = () => {
    stack({
      Component: ReportParameterBrowser,
      props: {
        reportName: reportName,
        rpbParams,
        setRpbParams
      },
      width: 700,
      height: 500,
      title: 'Report Parameters Browser'
    })
  }

  const formatDataForApi = rpbParams => {
    let minValue = Infinity

    for (const [index, { fieldId, value }] of Object.entries(rpbParams)) {
      const numericValue = Number(fieldId)
      if (numericValue < minValue) {
        minValue = numericValue
      }
    }

    const formattedData = rpbParams
      .map(({ fieldId, value }) => `${fieldId}|${value}`)
      .reduce((acc, curr, index) => acc + (index === minValue ? `${curr}` : `^${curr}`), '')

    return formattedData
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
      onClick: () => onApply({ rpbParams: formatDataForApi(rpbParams), search: search }),
      disabled: false
    }
  ]

  return (
    <GridToolbar
      onSearch={value => {
        onSearch(value)
      }}
      onSearchClear={() => {
        setSearch('')
        onClear()
      }}
      onSearchChange={value => {
        setSearch(value)
      }}
      inputSearch={hasSearch}
      actions={actions}
      bottomSection={
        rpbParams &&
        rpbParams.length > 0 && (
          <Grid container spacing={2} sx={{ display: 'flex', px: 2, pt: 2 }}>
            {rpbParams.map((param, i) => (
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
