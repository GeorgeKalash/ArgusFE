import { createContext, useContext, useEffect, useState } from 'react'
import { AuthContext } from './AuthContext'
import { SystemRepository } from '@argus/repositories/src/repositories/SystemRepository'
import { RequestsContext } from '@argus/shared-providers/src/providers/RequestsContext'
import { DataSets } from '@argus/shared-domain/src/resources/DataSets'

const DefaultsContext = createContext(null)

const DefaultsProvider = ({ children }) => {
  const { getRequest } = useContext(RequestsContext)
  const { user, languageId } = useContext(AuthContext)
  const userData = window.sessionStorage.getItem('userData')
  
  const [systemDefaults, setSystemDefaults] = useState({ list: [] })
  const [userDefaults, setUserDefaults] = useState([])
  const [systemChecks, setSystemChecks] = useState([])
  const [exportFormat, setExportFormat] = useState([])


  const fetchDefaults = async () => {
    const res = await getRequest({
      extension: SystemRepository.Defaults.qry,
      parameters: `_filter=`
    })
    setSystemDefaults(res || {})
  }

  const fetchUserDefaults = async () => {
    if (!user?.userId) return

    const res = await getRequest({
      extension: SystemRepository.UserDefaults.qry,
      parameters: `_userId=${user.userId}`
    })
    setUserDefaults(res || {})
  }

  const fetchSystemChecks = async () => {
    const res = await getRequest({
      extension: SystemRepository.SystemChecks.qry,
      parameters: `_scope=1`
    })
    setSystemChecks(res?.list || [])
  }

  const fetchCountryReference = async countryId => {
    if (!countryId) return

    const res = await getRequest({
      extension: SystemRepository.Country.get,
      parameters: `_recordId=${countryId}`
    })

    setSystemDefaults(prevState => ({
      ...prevState,
      list: [...prevState.list, { key: 'countryRef', value: res?.record?.reference }],
      count: prevState.list.length + 1
    }))

  }

  const updateSystemDefaults = data => {
    const updatedDefaultsData = [...systemDefaults.list, ...data].reduce((acc, obj) => {
      const existing = acc.find(item => item.key === obj.key)
      if (existing) existing.value = obj.value
      else acc.push({ ...obj, value: obj.value })
      
      return acc
    }, [])
    setSystemDefaults({ list: updatedDefaultsData })
  }

  const getExportFormat = async () => {
    const res = await getRequest({
      extension: SystemRepository.KeyValueStore,
      parameters: `_dataset=${DataSets.EXPORT_FORMAT}&_language=${languageId}`,
      disableLoading: true
    })
    if (res?.list?.length) setExportFormat(res?.list || [])
  }
  
  useEffect(() => {
    if (!userData || !user?.userId) return

    fetchDefaults()
    fetchUserDefaults()
    fetchSystemChecks()
    getExportFormat()
  }, [userData, user?.userId])

  useEffect(() => {
    if(!systemDefaults?.list?.length) return 

    const countryId = systemDefaults.list.find(item => item.key === 'countryId')?.value || null
    const hasCountryRef = systemDefaults.list.some(item => item.key === 'countryRef')
    
    if (hasCountryRef) return
    
    fetchCountryReference(countryId)
  }, [systemDefaults.list])

  const value = {
    systemDefaults,
    setSystemDefaults,
    updateSystemDefaults,
    userDefaults,
    setUserDefaults,
    systemChecks,
    exportFormat
  }

  return (
    <DefaultsContext.Provider value={value}>
      {children}
    </DefaultsContext.Provider>
  )
}

export { DefaultsContext, DefaultsProvider }