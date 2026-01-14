import { createContext, useContext, useEffect, useState } from 'react'
import { RequestsContext } from 'src/providers/RequestsContext'
import { KVSRepository } from 'src/repositories/KVSRepository'
import { AccessControlRepository } from 'src/repositories/AccessControlRepository'
import { ResourceIds } from 'src/resources/ResourceIds'
import { AuthContext } from './AuthContext'
import axios from 'axios'
import { SystemRepository } from 'src/repositories/SystemRepository'
import { useError } from 'src/error'
import { debounce } from 'lodash'
import { commonResourceIds } from 'src/resources/commonResourceIds'
import { useLabelsAccessContext } from './LabelsAccessContext'

const DefaultsContext = createContext()

const DefaultsProvider = ({ children }) => {
  const { getRequest } = useContext(RequestsContext)
  const { user, apiUrl, languageId } = useContext(AuthContext)
  const userData = window.sessionStorage.getItem('userData')
  const [defaultsData, setDefaultsData] = useState([])
  const [userDefaultsData, setUserDefaultsData] = useState([])
  const [systemChecks, setSystemChecks] = useState([])

  const countryId = defaultsData?.list?.find(({ key }) => key === 'countryId')?.value
    
  const getDefaults = callback => {
    getRequest({
      extension: SystemRepository.Defaults.qry,
      parameters: `_filter=`
    }).then(res => {
      callback(res)
    })
  }

  const getSystemChecks = callback => {
    getRequest({
      extension: SystemRepository.SystemChecks.qry,
      parameters:`_scope=1`
    }).then(res => {
      callback(res?.list || [])
    })
  }

  const updateDefaults = data => {
    const updatedDefaultsData = [...defaultsData.list, ...data].reduce((acc, obj) => {
      const existing = acc.find(item => item.key === obj.key)
      if (existing) {
        existing.value = obj.value
      } else {
        acc.push({ ...obj, value: obj.value })
      }

      return acc
    }, [])
    setDefaultsData({ list: updatedDefaultsData })
  }

  const getUserDefaults = callback => {
    if(!user?.userId) return

    getRequest({
      extension: SystemRepository.UserDefaults.qry,
      parameters: `_userId=` + user?.userId
    }).then(res => {
      callback(res)
    })
  }


  useEffect(() => {
    ;(async function () {
      if (!countryId) return
      
        const res = await getRequest({
          extension: SystemRepository.Country.get,
          parameters: `_recordId=${countryId}`
        })

        const newItem = { key: 'countryRef', value: res?.record?.reference }

        setDefaultsData(prevState => ({
          ...prevState,
          list: [...prevState.list, newItem],
          count: prevState.list.length + 1
        }))
      
    })()
  }, [countryId])

    useEffect(() => {
    if (userData && user?.userId) {
      getDefaults(setDefaultsData)
      getUserDefaults(setUserDefaultsData)
      getSystemChecks(setSystemChecks)
    }
  }, [userData, user?.userId])


    const values = {
    defaultsData,
    setDefaultsData,
    updateDefaults,
    userDefaultsData,
    setUserDefaultsData,
    systemChecks
  }

  return <DefaultsContext.Provider value={values}>{children}</DefaultsContext.Provider>
}

export { DefaultsContext, DefaultsProvider }