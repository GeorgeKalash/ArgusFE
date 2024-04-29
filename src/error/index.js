import React, { useContext, useState } from 'react'
import Error from 'src/components/Shared/Error'

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
        <Error key={index} height={props.height ?? 100} open={stack[index]} onClose={closeWindow} {...props} />
      ))}
    </ErrorContext.Provider>
  )
}

export function useError() {
  return useContext(ErrorContext)
}
