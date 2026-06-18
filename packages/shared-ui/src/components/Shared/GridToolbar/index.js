import { Grid, DialogActions } from '@mui/material'
import CustomTextField from '../../Inputs/CustomTextField'
import React, { useEffect, useState, useContext, useRef, useMemo } from 'react'
import { accessMap, TrxType } from '@argus/shared-domain/src/resources/AccessLevels'
import { ControlContext } from '@argus/shared-providers/src/providers/ControlContext'
import { getButtons } from '../Buttons'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import ReportGenerator from '../ReportGenerator'
import CustomButton from '@argus/shared-ui/src/components/Inputs/CustomButton'
import usePageInteraction from '@argus/shared-providers/src/providers/usePageInteraction'
import isEqual from 'lodash/isEqual'

const styles = {
  dialogActions: 'dialogActions',
  gridContainer: 'gridContainer',
  buttonWrapper: 'buttonWrapper',
  addButtonWrapper: 'addButtonWrapper',
  searchFieldWrapper: 'searchFieldWrapper',
  actionButtonsWrapper: 'actionButtonsWrapper',
  actionButtonsWrapperNoPadding: 'actionButtonsWrapperNoPadding',
  actionButton: 'actionButton'
}

const GridToolbar = ({
  onAdd,
  leftSection,
  rightSection,
  bottomSection,
  middleSection,
  inputSearch,
  onSearch,
  onSearchClear,
  onSearchChange,
  disableAdd = false,
  actions = [],
  previewReport,
  disableActionsPadding,
  resetKey,
  ...props
}) => {
  const maxAccess = props.maxAccess && props.maxAccess?.record?.accessFlags
  const addBtnVisible = onAdd && maxAccess && maxAccess[accessMap[TrxType.ADD]]

  const { getRequest } = useContext(RequestsContext)
  const [searchValue, setSearchValue] = useState('')
  const { platformLabels } = useContext(ControlContext)
  const [reportStore, setReportStore] = useState([])
  const trackInteraction = usePageInteraction()
  const initialFieldValuesRef = useRef(null)
  const previousFieldValuesRef = useRef(null)

  const extractFieldValues = React.useCallback(element => {
    const fields = new Map()

    const walk = node => {
      if (!React.isValidElement(node)) return

      const { name, value, values, formObject, form, children } = node.props || {}

      if (name && !fields.has(name)) {
        fields.set(
          name,
          value ?? values?.[name] ?? formObject?.[name] ?? form?.values?.[name]
        )
      }

      if (children) {
        React.Children.forEach(children, walk)
      }
    }

    walk(element)
    return Object.fromEntries(fields)
  }, [])

  const attachTrackingToClicks = React.useCallback(node => {
    if (!React.isValidElement(node)) return node
    const { children, onClick, initialValue, value, name } = node.props || {}
    const newProps = {}

    if (onClick) {
      newProps.onClick = (...args) => {
        const result = onClick(...args)

        if (value !== undefined && initialValue !== undefined) {
          const leftValues = extractFieldValues(leftSection)
          const middleValues = extractFieldValues(middleSection)
          const rightValues = extractFieldValues(rightSection)

          const currentValues = {
            ...leftValues,
            ...middleValues,
            ...rightValues,
            ...(name ? { [name]: value } : { value })
          }

          const initialValues = {
            ...initialFieldValuesRef.current,
            ...(name ? { [name]: initialValue } : { value: initialValue })
          }

          trackInteraction.trackPageFields(initialValues, currentValues)
        } else {
          trackInteraction('gridToolbar')
        }

        return result
      }
    }

    if (children) {
      newProps.children = React.Children.map(children, attachTrackingToClicks)
    }

    return React.cloneElement(node, newProps)
  }, [trackInteraction])

  const trackedLeftSection = useMemo(() => attachTrackingToClicks(leftSection), [leftSection, attachTrackingToClicks])
  const trackedMiddleSection = useMemo(() => attachTrackingToClicks(middleSection), [middleSection, attachTrackingToClicks])
  const trackedRightSection = useMemo(() => attachTrackingToClicks(rightSection), [rightSection, attachTrackingToClicks])
 
  useEffect(() => {
    if (!trackInteraction.isReady) return

    const leftValues = extractFieldValues(leftSection)
    const middleValues = extractFieldValues(middleSection)
    const rightValues = extractFieldValues(rightSection)
    const currentValues = {...leftValues, ...middleValues, ...rightValues}

    if (Object.keys(currentValues).length === 0) return

    const lastValues = previousFieldValuesRef.current
    if (!lastValues) {
      previousFieldValuesRef.current = currentValues
      initialFieldValuesRef.current = currentValues

      trackInteraction.trackPageFields(
        currentValues,
        currentValues
      )

      return
    }
  
    if (!isEqual(lastValues, currentValues)) {
      previousFieldValuesRef.current = currentValues
      trackInteraction.trackPageFields(currentValues, initialFieldValuesRef.current)
    }
  }, [
    leftSection,
    middleSection,
    rightSection,
    extractFieldValues,
    trackInteraction.isReady,
    trackInteraction.currentPageResourceId
  ])

  useEffect(() => {
    previousFieldValuesRef.current = null
    initialFieldValuesRef.current = null
  }, [resetKey])

  const clear = () => {
    trackInteraction()
    setSearchValue('')
    onSearch('')
    if (onSearchClear) onSearchClear()
  }

  const getReportLayout = async setReport => {
    setReportStore([])

    await getRequest({
      extension: SystemRepository.ReportLayout.qry,
      parameters: `_resourceId=${previewReport}`
    }).then(res => {
      if (res?.list) {
        const formattedReports = res.list.map(item => ({
          api_url:
            item.api.includes('_params=') && props?.reportParams
              ? item.api.replace('_params=', `_params=${props.reportParams}`)
              : item.api,
          reportClass: item.instanceName,
          parameters: item.parameters,
          layoutName: item.layoutName,
          assembly: 'ArgusRPT.dll'
        }))
        setReportStore(formattedReports)
        if (formattedReports.length > 0) {
          setReport(prev => ({
            ...prev,
            selectedReport: formattedReports[0]
          }))
        }
      }
    })
  }

  const buttons = getButtons(platformLabels)

  const actionButtonsClassName = [
    styles.actionButtonsWrapper,
    disableActionsPadding && styles.actionButtonsWrapperNoPadding
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <style jsx global>{`
        .dialogActions {
          padding: 4px 0 !important;
          display: flex;
          flex-direction: column;
        }

        .gridContainer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 0 14px;
        }

        .buttonWrapper,
        .addButtonWrapper {
          display: flex;
          justify-content: flex-start;
          align-items: center;
        }

        .searchFieldWrapper {
          display: flex;
          justify-content: flex-start;
          align-items: end;          
        }

        .actionButtonsWrapper {
          display: flex;
          justify-content: flex-start;
          align-items: center;       
          margin: 0 !important;
        }

        .actionButtonsWrapperNoPadding {
          padding-left: 0 !important;
        }
        .actionButton {
          margin-right: 6px;
          padding: 6px 12px;
          font-size: 14px;
        }

        @media (min-width: 1025px) {
          .gridContainer {
            padding: 0 12px;
          }

          .addButton,
          .actionButton {
            padding: 6px 12px;
            font-size: 13px;
          }
        }
        @media (min-width: 1025px) and (max-width: 1366px) {
        .paginationWrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 4px;
        }

        .paginationBar {
          flex: 1 1 auto;
          min-width: 0;
          background-color: #fff;

          /* smaller text */
          font-size: 10px !important;
          line-height: 1 !important;

          /* smaller height */
          height: 24px !important;
          padding: 0 4px !important;

          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        .paginationBar * {
          font-size: 10px !important;
          line-height: 1 !important;
        }

        .paginationBar :global(.MuiIconButton-root) {
          padding: 0 !important;
          width: 16px !important;
          height: 16px !important;
          min-width: 0 !important;
        }

        .paginationBar :global(.MuiSvgIcon-root) {
          font-size: 16px !important;
        }

        /* page input smaller + shorter */
        .pageTextField {
          padding: 0 !important;
          width: 56px !important;
        }

        .pageTextField :global(.MuiOutlinedInput-root),
        .pageTextField :global(.MuiInputBase-root) {
          height: 18px !important;
          min-height: 18px !important;
          font-size: 10px !important;
        }

        .pageTextField :global(.MuiOutlinedInput-input),
        .pageTextField :global(.MuiInputBase-input) {
          padding: 0 4px !important;
          font-size: 10px !important;
          line-height: 1 !important;
        }
        }

        @media (max-width: 1024px) {
          .gridContainer {
            flex-direction: column;
            align-items: flex-start;
            padding: 0 8px;
          }

          .addButton,
          .actionButton {
            padding: 5px 10px;
            font-size: 12.5px;
          }
        }

        @media (max-width: 768px) {
          .gridContainer {
            padding: 0 6px;
          }

          .addButton,
          .actionButton {
            padding: 4px 9px;
            font-size: 12px;
          }
        }

        @media (max-width: 600px) {
          .gridContainer {
            padding: 0 4px;
          }

          .addButton,
          .actionButton {
            padding: 4px 8px;
            font-size: 11.5px;
          }
        }

        @media (max-width: 480px) {
          .gridContainer {
            padding: 0 3px;
          }

          .addButton,
          .actionButton {
            padding: 3px 7px;
            font-size: 11px;
          }
        }

        @media (max-width: 375px) {
          .gridContainer {
            padding: 0 2px;
          }

          .addButton,
          .actionButton {
            padding: 3px 5px;
            font-size: 10.5px;
          }
        }

        @media (max-width: 360px) {
          .gridContainer {
            padding: 0 1px;
          }

          .addButton,
          .actionButton {
            padding: 2px 4px;
            font-size: 10px;
          }
        }

        @media (max-width: 320px) {
          .gridContainer {
            padding: 0 1px;
          }

          .addButton,
          .actionButton {
            padding: 2px 3px;
            font-size: 9.5px;
          }
        }
      `}</style>

      <DialogActions className={styles.dialogActions}>
        <Grid container spacing={2} className={styles.gridContainer}>
          <Grid item xs={previewReport ? 6 : 9}>
            <Grid container spacing={2}>
              {onAdd && addBtnVisible && (
                <Grid item className={styles.buttonWrapper}>
                  <CustomButton
                    onClick={onAdd}
                    color={'transparent'}
                    disabled={disableAdd}
                    image={'add.png'}
                    border='1px solid #4eb558'
                  />
                </Grid>
              )}

              {trackedLeftSection}

              {inputSearch && (
                <Grid item className={styles.searchFieldWrapper}>
                  <CustomTextField
                    name='search'
                    value={searchValue}
                    label={platformLabels.Search}
                    onClear={clear}
                    onChange={e => {
                      setSearchValue(e.target.value)
                      if (onSearchChange) onSearchChange(e.target.value)
                    }}
                    onSearch={value => {
                      trackInteraction('gridToolbar')
                      onSearch(value)
                    }}
                    search={true}
                  />
                </Grid>
              )}

              {trackedMiddleSection}

              <Grid item className={actionButtonsClassName}>
                {buttons
                  .filter(button => actions.some(action => action.key === button.key))
                  .map((button, index) => {
                    const correspondingAction = actions.find(action => action.key === button.key)
                    const isVisible = correspondingAction.condition
                    const isDisabled = correspondingAction.disabled
                    const handleClick = correspondingAction.onClick

                    return (
                      isVisible && (
                        <CustomButton
                          key={button.key || index}
                          onClick={() => {
                            if (button.key == 'GO' ? searchValue?.trim() || props?.reportParams : false) trackInteraction('gridToolbar')
                            handleClick()
                           }
                          }
                          image={button.image}
                          tooltip={button.label}
                          label={button.label}
                          disabled={isDisabled}
                        />
                      )
                    )
                  })}
              </Grid>
            </Grid>
          </Grid>

          {previewReport && (
            <ReportGenerator
              getReportLayout={getReportLayout}
              previewReport={previewReport}
              condition={props?.reportParams}
              reportStore={reportStore}
            />
          )}

          {rightSection && (
            <Grid item xs={3}>
              {trackedRightSection}
            </Grid>
          )}
        </Grid>

        {bottomSection}
      </DialogActions>
    </>
  )
}

export default GridToolbar
