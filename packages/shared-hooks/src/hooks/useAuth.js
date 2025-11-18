import { useContext } from 'react'
import { AuthContext } from 'src/providers/AuthContext'

export const useAuth = () => useContext(AuthContext)
