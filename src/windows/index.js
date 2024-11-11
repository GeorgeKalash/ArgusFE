import React, { useContext, useEffect, useRef, useState } from 'react'
import Window from 'src/components/Shared/Window'
import useResourceParams from 'src/hooks/useResourceParams'
import { v4 as uuidv4 } from 'uuid'

const WindowContext = React.createContext(null)
const ClearContext = React.createContext(null)

export function WindowProvider({ children }) {
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

  return (
    <WindowContext.Provider value={{ stack: addToStack }}>
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
                const currentValue = { ...stack[stack.length - 1] }
                if (Object.keys(currentValue).length) {
                  closeWindow()
                  currentValue.props.recordId = null
                  currentValue.nextTo = ''
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
                window={{
                  close: () => closeWindowById(id)
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
