import React, { useContext, useEffect, useRef, useState } from 'react'
import Window from 'src/components/Shared/Window'
import useResourceParams from 'src/hooks/useResourceParams'
import { RequestsContext } from 'src/providers/RequestsContext'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
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
      if (res.record && res.record.userId != obj.userId) {
        obj.isAlreadyLocked ? obj.isAlreadyLocked(res.record.userName) : null

        return
      }

      const body = {
        resourceId: obj.resourceId,
        recordId: obj.recordId,
        reference: obj.reference,
        userId: userId,
        clockStamp: new Date()
      }

      postRequest({
        extension: AccessControlRepository.lockRecord,
        record: JSON.stringify(body)
      }).then(res => {
        setLockProps(obj)
        obj.onSuccess ? obj.onSuccess() : null
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
    setStack(stack => {
      return stack.slice(0, stack.length - 1)
    })
  }

  function closeWindowById(givenId) {
    unlockRecord()
    closedWindow.current = currentValue
    setStack(stack.filter(({ id }) => givenId != id))
  }

  function openWindow(id) {
    if (closedWindow.current) {
      if (closedWindow?.current?.id === id) {
        addToStack(closedWindow.current)
      }
    } else {
      return
    }
  }

  function addToStack(options) {
    const { Component } = options

    setStack(stack => [
      ...stack,
      {
        ...options,
        width: Component?.width || options.width,
        height: Component?.height || options.height,
        id: uuidv4()
      }
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
          draggable,
          height,
          styles
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
              }
            }}
          >
            <Window
              key={id}
              sx={{ display: 'flex !important', flex: '1' }}
              Title={title}
              nextToTitle={nextToTitle}
              controlled={true}
              onClose={() => {
                closeWindow()
                if (onClose) onClose()
              }}
              width={width}
              height={height}
              expandable={expandable}
              draggable={draggable}
              closable={closable}
              styles={styles}
            >
              <Component
                {...props}
                {...(props?.maxAccess
                  ? { maxAccess: { ...props?.maxAccess, editMode: !!props.recordId } }
                  : { access: { ...props?.access, editMode: !!props?.recordId } })}
                window={{
                  close: () => closeWindowById(id),
                  setTitle: newTitle => updateWindow(id, { title: title || newTitle })
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

  const { labels: _labels, access } = useResourceParams({
    datasetId: datasetId
  })

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
      props: {
        access,
        _labels,
        ...props
      },
      expandable: false,
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
