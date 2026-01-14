import React, { useContext, useEffect, useRef, useState } from 'react'
import Window from '@argus/shared-ui/src/components/Shared/Window'
import useResourceParams from '@argus/shared-hooks/src/hooks/useResourceParams'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { AccessControlRepository } from '@argus/repositories/src/repositories/AccessControlRepository'
import { v4 as uuidv4 } from 'uuid'

const WindowContext = React.createContext(null)
const ClearContext = React.createContext(null)

export function WindowProvider({ children }) {
  const [stack, setStack] = useState([])
  const { postRequest, getRequest } = useContext(RequestsContext)
  const [rerenderFlag, setRerenderFlag] = useState(false)
  const [lockProps, setLockProps] = useState(null)
  const closedWindow = useRef(null)
  const userId = JSON.parse(window.sessionStorage.getItem('userData'))?.userId
  const currentValue = { ...stack[stack.length - 1] }

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
    unlockRecord()
    setStack(stack => stack.slice(0, stack.length - 1))
  }

  function closeWindowById(givenId) {
    unlockRecord()
    closedWindow.current = currentValue
    setStack(stack.filter(({ id }) => givenId != id))
  }

  function openWindow(id) {
    if (closedWindow.current?.id === id) addToStack(closedWindow.current)
  }

  function addToStack(options) {
    const { Component } = options
    setStack(stack => [
      ...stack,
      { ...options, width: Component?.width || options.width, height: Component?.height || options.height, id: uuidv4() }
    ])
  }

  function updateWindow(id, updates) {
    setStack(prev => prev.map(w => (w.id === id ? { ...w, ...updates } : w)))
  }

  return (
    <WindowContext.Provider value={{ stack: addToStack, lockRecord }}>
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
          minimizable
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
                  setNextToTitle :  newTitle  =>   updateWindow(id, { nextToTitle: newTitle || title }),
                }}
              />
            </Window>
          </ClearContext.Provider>
        )
      )}
    </WindowContext.Provider>
  )
}

export function ImmediateWindow({ datasetId, Component, labelKey, titleName, height, width, props = {} }) {
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
      width: width || 600,
      height: height || 400,
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
