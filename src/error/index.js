import React, { useContext, useState } from 'react'
import ErrorWindow from 'src/components/Shared/ErrorWindow'

const ErrorContext = React.createContext(null)

export function ErrorProvider({ children }) {
  const [stack, setStack] = useState([])

  function closeWindow() {
    setStack(stack => {
      return stack.slice(0, stack.length - 1)
    })
  }

  return (
    <ErrorContext.Provider
      value={{
        stack(options) {
          setStack(stack => [...stack, options])
        }
      }}
    >
      {children}
      {stack.map((props, index) => (
        <ErrorWindow key={index} open={stack[index]} onClose={closeWindow} {...props} />
      ))}
    </ErrorContext.Provider>
  )
}

export function useError() {
  return useContext(ErrorContext)
}
