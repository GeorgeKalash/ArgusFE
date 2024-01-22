import React, { useContext, useState } from 'react'
import Window from 'src/components/Shared/Window'

const WindowContext = React.createContext(null)

export function WindowProvider({ children }) {
  const [stack, setStack] = useState([])

  return (
    <WindowContext.Provider
      value={{
        stack({ title, Component }) {
          setStack(stack => [
            ...stack,
            {
              title,
              Component
            }
          ])
        }
      }}
    >
      {children}
      {stack.map(({ Component, title, width = 800, height = 400 }, index) => (
        <Window
          key={index}
          Title={title}
          controlled={true}
          onClose={() => {
            setStack(stack => {
              const [, ...rest] = stack

              return rest
            })
          }}
          width={width}
          height={height}
        >
          <Component />
        </Window>
      ))}
    </WindowContext.Provider>
  )
}

export function useWindow() {
  return useContext(WindowContext)
}
