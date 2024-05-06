import React, { useContext, useState } from 'react'
import ErrorPage from 'src/components/Shared/PageError'

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
        <ErrorPage key={index} height={props.height} open={stack[index]} onClose={closeWindow} {...props} />
      ))}
    </ErrorContext.Provider>
  )
}

export function useError() {
  return useContext(ErrorContext)
}
