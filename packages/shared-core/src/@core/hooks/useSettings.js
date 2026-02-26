import { useContext } from 'react'
import { SettingsContext } from '@argus/shared-core/src/@core/context/settingsContext'

export const useSettings = () => useContext(SettingsContext)
