import { createContext, useContext } from 'react'

export const LayoutContext = createContext({ hasNavbar: true })
export const useLayout = () => useContext(LayoutContext)