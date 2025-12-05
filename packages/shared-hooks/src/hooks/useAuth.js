import { useContext } from 'react'
import { AuthContext } from '@argus/shared-providers/src/providers/AuthContext'

export const useAuth = () => useContext(AuthContext)
