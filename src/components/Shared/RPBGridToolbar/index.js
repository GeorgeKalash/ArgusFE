import React, { useState, useEffect, useContext } from 'react'
import GridToolbar from 'src/components/Shared/GridToolbar'
import { useWindow } from 'src/windows'
import ReportParameterBrowser from 'src/components/Shared/ReportParameterBrowser'
import { Grid } from '@mui/material'
import { useError } from 'src/error'
import { ControlContext } from 'src/providers/ControlContext'
import styles from './RPBGridToolbar.module.css'

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
  leftSection,
  disableActionsPadding,
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
      disableActionsPadding={disableActionsPadding} 
      leftSection={
        leftSection && (
          <Grid item className={styles.leftSectionGridItem}>
            {leftSection}
          </Grid>
        )
      }
      bottomSection={
        rpbParams &&
        rpbParams.length > 0 && (
          <Grid container className={styles.bottomSectionContainer}>
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
