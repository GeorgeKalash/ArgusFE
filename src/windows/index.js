import { Box } from '@mui/material'
import React, { useContext, useEffect, useState } from 'react'
import Window from 'src/components/Shared/Window'
import useResourceParams from 'src/hooks/useResourceParams'
import { v4 as uuidv4 } from 'uuid'

const WindowContext = React.createContext(null)
const ClearContext = React.createContext(null)

function Overlay() {
  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'transparent', 
        zIndex: 999 
      }}
    />
  )
}

export function WindowProvider({ children }) {
  const [stack, setStack] = useState([])

  function closeWindow() {
    setStack(stack => {
      return stack.slice(0, stack.length - 1)
    })
  }

  function addToStack(options) {
    setStack(stack => [...stack, { ...options, id: uuidv4() }])
  }

  return (
    <WindowContext.Provider value={{ stack: addToStack }}>
      <ClearContext.Provider
        value={{
          clear() {
            const currentValue = { ...stack[stack.length - 1] }
            closeWindow()
            currentValue.props.recordId = null
            addToStack(currentValue)
          }
        }}
      >
        {children}
        {stack.length > 0 && <Overlay />}
        {stack.map(
          ({ id, Component, title, width = 800, props, onClose, closable, expandable, draggable, height, styles }) => (
            <div key={id} style={{ zIndex: 1000 }}>
              <Window
                key={id}
                sx={{ display: 'flex !important', flex: '1' }}
                Title={title}
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
                    close: closeWindow
                  }}
                />
              </Window>
            </div>
          )
        )}
      </ClearContext.Provider>
    </WindowContext.Provider>
  )
}

export function ImmediateWindow({ datasetId, Component, titleName, height, props = {} }) {
  const { stack } = useWindow()

  const { labels: _labels, access } = useResourceParams({
    datasetId: datasetId
  })

  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    if (_labels[titleName] && !rendered) {
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
      title: _labels[titleName]
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
