import React, { useContext, useEffect, useRef, useState } from 'react'
import Window from '@argus/shared-ui/src/components/Shared/Window'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import { v4 as uuidv4 } from 'uuid'
import { TabsContext } from '../TabsContext'
import usePageInteraction from '../usePageInteraction'
import { useInteractionTracker } from '../InteractionTrackerProvider'

const WindowContext = React.createContext(null)
const ClearContext = React.createContext(null)

const CLOSED_MENU_WIDTH = 72
const DEFAULT_WINDOW_MARGIN = 32
const DEFAULT_VERTICAL_MARGIN = 32

function getWindowDimensions(width, height, spacing = true) {
  if (typeof window === 'undefined') {
    return {
      width: width || 800,
      height: height || 400
    }
  }

  if (!spacing) {
    const computedWidth =
      width ||
      Math.max(400, window.innerWidth - CLOSED_MENU_WIDTH - DEFAULT_WINDOW_MARGIN)

    const computedHeight =
      height ||
      Math.max(300, window.innerHeight - DEFAULT_VERTICAL_MARGIN)

    return {
      width: computedWidth,
      height: computedHeight
    }
  }

  return {
    width: width || 800,
    height: height || 600
  }
}

export function WindowProvider({ children }) {
  const [stack, setStack] = useState([])
  const { postRequest, getRequest } = useContext(RequestsContext)
  const [rerenderFlag, setRerenderFlag] = useState(false)
  const [lockProps, setLockProps] = useState(null)
  const closedWindow = useRef(null)
  const userId =
    typeof window !== 'undefined'
      ? JSON.parse(window.sessionStorage.getItem('userData'))?.userId
      : null

  const trackInteraction = usePageInteraction()
  const { clearPageInteractions, interactions } = useInteractionTracker()

  const tabsContext = useContext(TabsContext)
  const currentTab = tabsContext?.currentTab || null

  const currentValue = { ...stack[stack.length - 1] }
  const isImmediateWindow = currentValue?.isImmediateWindow ?? false

  function lockRecord(obj) {
    getRequest({
      extension: AccessControlRepository.LockedRecords.get,
      parameters: `_resourceId=${obj.resourceId}&_recordId=${obj.recordId}`
    }).then(res => {
      if (res.record && res.record.userId != userId) {
        obj.isAlreadyLocked?.(res.record.userName)
        return
      }

      const body = {
        resourceId: obj.resourceId,
        recordId: obj.recordId,
        reference: obj.reference,
        userId,
        clockStamp: new Date()
      }

      postRequest({
        extension: AccessControlRepository.lockRecord,
        record: JSON.stringify(body)
      }).then(() => {
        setLockProps(obj)
        obj.onSuccess?.()
      })
    })
  }

  function unlockRecord() {
    if (lockProps) {
      const body = {
        resourceId: lockProps.resourceId,
        recordId: lockProps.recordId,
        reference: lockProps.reference,
        userId: userId,
        clockStamp: new Date()
      }
      postRequest({
        extension: AccessControlRepository.unlockRecord,
        record: JSON.stringify(body)
      })
      setLockProps(null)
    }
  }

  function closeWindow() {
    if (currentTab?.resourceId) clearPageInteractions(currentTab.resourceId, 'Window')
    const closingWindow = stack[stack.length - 1]

    if (
      lockProps &&
      closingWindow?.props?.recordId === lockProps.recordId
    ) {
      unlockRecord()
    }
    setStack(stack => stack.slice(0, stack.length - 1))
  }

  function closeWindowById(givenId) {
    if (currentTab?.resourceId) clearPageInteractions(currentTab.resourceId, 'Window')
    unlockRecord()
    closedWindow.current = currentValue
    setStack(stack => stack.filter(({ id }) => givenId != id))
  }

  function openWindow(id) {
    if (closedWindow.current?.id === id) addToStack(closedWindow.current)
  }

  function addToStack(options) {
    const { Component, spacing = true, trackPage = true, windowType = null} = options
    const dimensions = getWindowDimensions(options.width, options.height, spacing)
    if (trackPage && windowType != 'ReportParameterBrowser') trackInteraction('Window')

    setStack(stack => [
      ...stack,
      {
        ...options,
        spacing,
        width: Component?.width || dimensions.width,
        height: Component?.height || dimensions.height,
        id: uuidv4()
      }
    ])
  }

  function updateWindow(id, updates) {
    setStack(prev =>
      prev.map(w => {
        if (w.id !== id) return w

        const nextSpacing = updates.spacing ?? w.spacing
        const nextWidth = updates.width ?? w.width
        const nextHeight = updates.height ?? w.height
        const dimensions = getWindowDimensions(nextWidth, nextHeight, nextSpacing)

        return {
          ...w,
          ...updates,
          spacing: nextSpacing,
          width: dimensions.width,
          height: dimensions.height
        }
      })
    )
  }

  return (
    <WindowContext.Provider value={{ stack: addToStack, lockRecord, isImmediateWindow, isInsideWindow: stack.length > 0 }}>
      {children}
      {stack.map(
        ({
          id,
          Component,
          title,
          nextToTitle,
          width = 800,
          props,
          onClose,
          closable,
          expandable,
          refresh,
          draggable,
          height,
          styles,
          minimizable,
          spacing = true
        }) => (
          <ClearContext.Provider
            key={rerenderFlag}
            value={{
              open: () => openWindow(id),
              clear() {
                if (Object.keys(currentValue).length) {
                  closeWindow()
                  currentValue.props.recordId = null
                  currentValue.nextToTitle = ''
                  addToStack(currentValue)
                } else {
                  setRerenderFlag(!rerenderFlag)
                }
              },
              setRecord: (recordId, record) => {
                setStack(prevStack => {
                  const nextStack = prevStack.map(window =>
                    window.id === id
                      ? {
                          ...window,
                          props: {
                            ...window.props,
                            ...record,
                            recordId,
                            ...(record &&
                            Object.values(record).some(value => value !== '' && value !== null && value !== undefined)
                              ? { record }
                              : {})
                          }
                        }
                      : window
                  )

                  return nextStack
                })
              }
            }}
          >
            <Window
              key={id}
              Title={title}
              nextToTitle={nextToTitle}
              controlled
              spacing={spacing}
              onClose={() => {
                closeWindow()
                onClose?.()
              }}
              onRefresh={() => {
                closeWindowById(id)
                openWindow(id)
              }}
              width={width}
              height={height}
              expandable={expandable}
              refresh={refresh}
              draggable={draggable}
              closable={closable}
              minimizable={minimizable}
              styles={styles}
            >
              <Component
                {...props}
                {...(props?.maxAccess
                  ? { maxAccess: { ...props?.maxAccess, editMode: !!props.recordId } }
                  : { access: { ...props?.access, editMode: !!props?.recordId } })}
                window={{
                  close: () => closeWindowById(id),
                  setTitle: newTitle => updateWindow(id, { title: newTitle || title }),
                  setNextToTitle: newTitle => updateWindow(id, { nextToTitle: newTitle || title }),
                  setSpacing: value => updateWindow(id, { spacing: value })
                }}
              />
            </Window>
          </ClearContext.Provider>
        )
      )}
    </WindowContext.Provider>
  )
}

export function ImmediateWindow({
  datasetId,
  Component,
  labelKey,
  titleName,
  height,
  width,
  props = {},
  spacing = true
}) {
  const { stack } = useWindow()
  const { labels: _labels, access } = useResourceParams({ datasetId })
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    if ((_labels[labelKey] || titleName) && !rendered) {
      openForm()
      setRendered(true)
    }
  }, [_labels, rendered])

  function openForm() {
    stack({
      Component,
      props: { access, _labels, ...props },
      expandable: false,
      minimizable: false,
      refresh: false,
      closable: false,
      draggable: false,
      spacing,
      width,
      height,
      trackPage: false,
      isImmediateWindow: true,
      title: _labels[labelKey] || titleName
    })
  }

  return null
}

export function useWindow() {
  return useContext(WindowContext)
}

export function useGlobalRecord() {
  return useContext(ClearContext)
}
