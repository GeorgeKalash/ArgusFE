import React, { useContext, useEffect, useRef, useState } from 'react'
import Window from 'src/components/Shared/Window'
import useResourceParams from 'src/hooks/useResourceParams'
import { CurrentWindowContext, RequestsLoadingContext } from 'src/pages/_app'
import ChildComponent from 'src/utils/ChildComponent'
import { v4 as uuidv4 } from 'uuid'

const WindowContext = React.createContext(null)
const ClearContext = React.createContext(null)

export function WindowProvider({ children }) {
  const { isLoadingRequests, closeWindowById: closeLoadingWindowById } = useContext(RequestsLoadingContext)
  const { currentWindowId, updateCurrentWindowId } = useContext(CurrentWindowContext)

  const [stack, setStack] = useState([])
  const [rerenderFlag, setRerenderFlag] = useState(false)
  const closedWindow = useRef(null)

  function closeWindow() {
    setStack(stack => {
      return stack.slice(0, stack.length - 1)
    })
  }

  function closeWindowById(givenId) {
    const currentValue = { ...stack[stack.length - 1] }
    closedWindow.current = currentValue
    setStack(stack.filter(({ id }) => givenId != id))
    closeLoadingWindowById(currentWindowId)
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
    setStack(stack => [...stack, { ...options, id: uuidv4() }])
  }

  const isLoading = windowId =>
    isLoadingRequests[windowId]?.filter(item => item === true).length !==
    isLoadingRequests[windowId]?.filter(item => item === false).length

  const hasLoadedBefore = stack?.some(item => isLoadingRequests?.[item.Component.name])

  return (
    <WindowContext.Provider value={{ stack: addToStack }}>
      {children}
      {stack.map(
        ({ id, Component, title, width = 800, props, onClose, closable, expandable, draggable, height, styles }) => (
          <ClearContext.Provider
            key={rerenderFlag}
            value={{
              open: () => openWindow(id),
              clear() {
                const currentValue = { ...stack[stack.length - 1] }
                if (Object.keys(currentValue).length) {
                  closeWindow()
                  currentValue.props.recordId = null
                  addToStack(currentValue)
                } else {
                  setRerenderFlag(!rerenderFlag)
                }
              }
            }}
          >
            <div
              style={{ display: !props.recordId || (!isLoading(Component.name) && hasLoadedBefore) ? 'block' : 'none' }}
            >
              <Window
                key={id}
                sx={{ display: 'flex !important', flex: '1' }}
                Title={title}
                controlled={true}
                onClose={() => {
                  closeLoadingWindowById(Component.name)
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
                <ChildComponent
                  props={props}
                  Component={Component}
                  closeWindowById={() => closeWindowById(id)}
                  updateCurrentWindowId={updateCurrentWindowId}
                />
              </Window>
            </div>
          </ClearContext.Provider>
        )
      )}
    </WindowContext.Provider>
  )
}

export function ImmediateWindow({ datasetId, Component, labelKey, titleName, height, props = {} }) {
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
      width: 600,
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
