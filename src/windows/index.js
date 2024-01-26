import React, { useContext, useState } from 'react'
import Window from 'src/components/Shared/Window'

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
      {stack.map(({ Component, title, width = 800, height = 400, props }, index) => (
        <Window key={index} Title={title} controlled={true} onClose={closeWindow} width={width} height={height}>
          <Component
            {...props}
            window={{
              close: closeWindow
            }}
          />
        </Window>
      ))}
    </WindowContext.Provider>
  )
}

export function useWindow() {
  return useContext(WindowContext)
}
