import React, { useState, useEffect } from 'react'
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
  filterBy,
  ...rest
}) => {
  const { stack } = useWindow()
  const [rpbParams, setRpbParams] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    setRpbParams([])
  }, [reportName])

  const filters = (filter, params) => {
    if (typeof filterBy === 'function') {
      if (filter) filterBy('qry', filter)
      else filterBy('params', params)
    } else {
      onSearch(filter, params)
    }
  }

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
        minValue = numericValue - 1
      }
    }

    const formattedData = rpbParams
      ?.filter(({ fieldId, value }) => fieldId && value)
      .map(({ fieldId, value }) => `${fieldId}|${value}`)
      .reduce((acc, curr, index) => acc + (index === 0 ? `${curr}` : `^${curr}`), '')

    return formattedData
  }

  const formatDataDictForApi = rpbParams => {
    const formattedData = rpbParams.reduce((acc, { display }, index) => {
      acc[index] = display || ''

      return acc
    }, {})

    return formattedData
  }

  const reportParams = formatDataForApi(rpbParams)

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
      onClick: () => {
        if (typeof filterBy === 'function') filters(search, reportParams)
        else
          onApply({
            rpbParams: reportParams,
            paramsDict: reportParams,
            search: search
          })
      },
      disabled: false
    }
  ]

  return (
    <GridToolbar
      onSearch={value => filters(value, reportParams)}
      onSearchClear={() => {
        setSearch('')
        if (typeof filterBy === 'function') filterBy('params', reportParams)
        else onClear(reportParams)
      }}
      onSearchChange={value => {
        value != '' ? setSearch(value) : setSearch('')
      }}
      inputSearch={hasSearch}
      actions={actions}
      bottomSection={
        rpbParams &&
        rpbParams.length > 0 && (
          <Grid container sx={{ display: 'flex', pt: 2, margin: '0px !important' }}>
            {rpbParams.map(
              (param, i) =>
                param.display && (
                  <Grid key={i} item>
                    [<b>{param.caption}:</b> {param.display}]
                  </Grid>
                )
            )}
          </Grid>
        )
      }
      {...rest}
    />
  )
}

export default RPBGridToolbar
