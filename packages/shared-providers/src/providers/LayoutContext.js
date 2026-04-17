import { createContext, useContext } from 'react'

export const LayoutContext = createContext({ hasNavbar: true })
export const useLayout = () => useContext(LayoutContext)

export const LayoutProvider = ({ children, value }) => {
  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>
}