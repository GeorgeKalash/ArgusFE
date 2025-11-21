import React, { useState, useEffect, useContext } from 'react'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import ReportParameterBrowser from '@argus/shared-ui/src/components/Shared/ReportParameterBrowser'
import { Grid } from '@mui/material'
import { useError } from '@argus/shared-providers/src/providers/error'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

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
  paramsRequired = false,
  ...rest
}) => {
  const { stack } = useWindow()
  const [rpbParams, setRpbParams] = useState([])
  const [search, setSearch] = useState('')
  const { stack: stackError } = useError()
  const { platformLabels } = useContext(ControlContext)

  useEffect(() => {
    setRpbParams([])
  }, [reportName])

  const filters = (filter, params) => {
    if (paramsRequired && !params) {
      stackError({
        message: platformLabels?.noParamsErrorMessage
      })
    }
    if (filter) filterBy('qry', filter?.replace(/\+/g, '%2B'), !!reportName)
    else filterBy('params', params)
  }

  const openRPB = () => {
    stack({
      Component: ReportParameterBrowser,
      props: {
        reportName: reportName,
        rpbParams,
        setRpbParams
      }
    })
  }

  const formatDataDictForApi = rpbParams => {
    const formattedData = rpbParams.reduce((acc, { display }, index) => {
      acc[index] = display || ''

      return acc
    }, {})

    return formattedData
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

  const reportParams = formatDataForApi(rpbParams)

  const actions = [
    {
      key: 'OpenRPB',
      condition: true,
      onClick: openRPB,
      disabled: false,
      hidden: !reportName
    },
    {
      key: 'GO',
      condition: true,
      onClick: () => {
        if (typeof filterBy === 'function') filters(search, reportParams)
        else
          onApply({
            rpbParams: reportParams,
            paramsDict: formatDataDictForApi(rpbParams),
            search: search
          })
      }
    },
    {
      key: 'Print',
      condition: !!rest?.Print,
      onClick: () => rest?.Print(rpbParams),
      disabled: rest?.disablePrint
    }
  ].filter(item => !item?.hidden)

  return (
    <GridToolbar
      onSearch={value => filters(value, reportParams)}
      reportParams={reportParams}
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
