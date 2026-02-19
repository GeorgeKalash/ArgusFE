import React, { useState, useEffect, useContext } from 'react'
import GridToolbar from '@argus/shared-ui/src/components/Shared/GridToolbar'
import { useWindow } from '@argus/shared-providers/src/providers/windows'
import ReportParameterBrowser from '@argus/shared-ui/src/components/Shared/ReportParameterBrowser'
import { Grid } from '@mui/material'
import { useError } from '@argus/shared-providers/src/providers/error'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'

const styles = {
  leftSectionGridItem: 'leftSectionGridItem',
  bottomSectionContainer: 'bottomSectionContainer'
}

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
    <>
      <style jsx global>{`
        .leftSectionGridItem {
          width: 33.3333%;
          display: flex;
          justify-content: flex-start;
          align-items: end;
        }

        .bottomSectionContainer {
          display: flex !important;
          flex-wrap: wrap;
          padding-top: 12px;
          margin: 0 !important;
          gap: 4px 12px;
          align-items: center;
          font-size: 12px;
        }

        @media (max-width: 1600px) {
          .leftSectionGridItem {
            width: 40%;
            display: flex;
            justify-content: flex-start;
            align-items: end;
          }

          .bottomSectionContainer {
            font-size: 11px;
          }
        }

        @media (max-width: 1280px) {
          .leftSectionGridItem {
            width: 50%;
            display: flex;
            justify-content: flex-start;
            align-items: end;
          }

          .bottomSectionContainer {
            font-size: 10px;
          }
        }

        @media (max-width: 1024px) {
          .leftSectionGridItem {
            width: 60%;
            display: flex;
            justify-content: flex-start;
            align-items: end;
          }

          .bottomSectionContainer {
            font-size: 9px;
          }
        }

        @media (max-width: 768px) {
          .leftSectionGridItem {
            width: 100%;
            margin-top: 8px;
          }

          .bottomSectionContainer {
            justify-content: flex-start;
            font-size: 8px;
          }
        }

        @media (max-width: 480px) {
          .bottomSectionContainer {
            gap: 2px 6px;
            font-size: 7px;
          }
        }

        @media (max-width: 360px) {
          .bottomSectionContainer {
            gap: 2px 4px;
            font-size: 6px;
          }
        }
      `}</style>

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
    </>
  )
}

export default RPBGridToolbar
