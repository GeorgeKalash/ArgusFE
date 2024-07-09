import React, { useContext, useEffect, useState } from 'react'
import Window from 'src/components/Shared/Window'
import useResourceParams from 'src/hooks/useResourceParams'

const WindowContext = React.createContext(null)

export function WindowProvider({ children }) {
  const [stack, setStack] = useState([])

  function closeWindow() {
    setStack(stack => {
      return stack.slice(0, stack.length - 1)
    })
  }

  return (
    <WindowContext.Provider
      value={{
        stack(options) {
          setStack(stack => [...stack, options])
        }
      }}
    >
      {children}
      {stack.map(
        (
          {
            Component,
            title,
            width = 800,
            props,
            onClose,
            closable,
            expandable,
            draggable,
            height,
            styles,
            spacing = true
          },
          index
        ) => (
          <Window
            key={index}
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
            spacing={spacing}
          >
            <Component
              {...props}
              window={{
                close: closeWindow
              }}
            />
          </Window>
        )
      )}
    </WindowContext.Provider>
  )
}

export function ImmediateWindow({ datasetId, Component, titleName, height }) {
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
        _labels
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
